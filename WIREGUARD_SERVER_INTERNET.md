# WireGuard Server: Bikin Client Bisa Internet

Agar client WireGuard bisa internet lewat server, di **server** perlu:
1. IP forwarding aktif
2. NAT (masquerade) dari subnet WireGuard ke interface keluar server

---

## 1. Cek interface keluar server

Di server, cari interface yang dipakai ke internet (bukan `wg0`):

```bash
ip route show default
# Contoh hasil: default via 192.168.1.1 dev eth0
# Interface keluar = eth0 (bisa juga ens3, enp0s3, dll)
```

Catat nama interface itu (misalnya `eth0`). Nanti dipakai di bawah.

---

## 2. Aktifkan IP forwarding

Jalankan di server:

```bash
# Sekarang
sudo sysctl -w net.ipv4.ip_forward=1

# Supaya tetap setelah reboot (pilih salah satu)
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf
# atau
echo 'net.ipv4.ip_forward=1' | sudo tee /etc/sysctl.d/99-wireguard.conf
sudo sysctl -p /etc/sysctl.d/99-wireguard.conf
```

Kalau client pakai IPv6, aktifkan juga:

```bash
sudo sysctl -w net.ipv6.conf.all.forwarding=1
echo 'net.ipv6.conf.all.forwarding=1' | sudo tee -a /etc/sysctl.conf
```

---

## 3. NAT (masquerade) di server

Subnet WireGuard di server biasanya di set di config, misalnya `10.0.0.0/24` atau `10.66.66.0/24`. Ganti **SUBNET** dan **INTERFACE_KELUAR** sesuai punya kamu.

### Pakai iptables (umum)

```bash
# Ganti 10.0.0.0/24 dengan subnet WireGuard kamu (Address di [Interface] server)
# Ganti eth0 dengan interface keluar (dari langkah 1)
sudo iptables -t nat -A POSTROUTING -s 10.0.0.0/24 -o eth0 -j MASQUERADE
```

Contoh kalau subnet WG = `10.66.66.0/24` dan interface = `ens3`:

```bash
sudo iptables -t nat -A POSTROUTING -s 10.66.66.0/24 -o ens3 -j MASQUERADE
```

Agar rule tetap setelah reboot (Debian/Ubuntu):

```bash
sudo apt install -y iptables-persistent
sudo netfilter-persistent save
# atau
sudo iptables-save | sudo tee /etc/iptables/rules.v4
```

### Pakai nftables (jika pakai nftables)

```bash
sudo nft add table nat
sudo nft 'add chain nat postrouting { type nat hook postrouting priority 100 \; }'
sudo nft add rule nat postrouting ip saddr 10.0.0.0/24 oifname "eth0" masquerade
```

Sesuaikan subnet dan nama interface.

---

## 4. Cek config WireGuard di server

Pastikan di server ada `Address` untuk interface (subnet server):

```ini
# /etc/wireguard/wg0.conf (server)
[Interface]
PrivateKey = ...
Address = 10.0.0.1/24
ListenPort = 51820
# Setelah itu jalankan sysctl + iptables di atas
```

Client harus punya `Address` dalam subnet yang sama (mis. `10.0.0.2/24`) dan `AllowedIPs = 0.0.0.0/0` (dan `::/0` kalau pakai IPv6) kalau mau semua lalu lintas lewat VPN.

---

## 5. Firewall di server

Kalau pakai ufw:

```bash
sudo ufw allow 51820/udp
sudo ufw allow from 10.0.0.0/24
# Penting: izinkan forward
# Edit /etc/default/ufw: DEFAULT_FORWARD_POLICY="ACCEPT"
echo 'DEFAULT_FORWARD_POLICY="ACCEPT"' | sudo tee -a /etc/default/ufw
sudo ufw reload
```

Kalau pakai firewalld:

```bash
sudo firewall-cmd --permanent --add-port=51820/udp
sudo firewall-cmd --permanent --zone=trusted --add-source=10.0.0.0/24
sudo firewall-cmd --permanent --zone=public --add-masquerade
sudo firewall-cmd --reload
```

---

## 6. Cek singkat

- Di server: `curl -I https://google.com` (harus bisa).
- Di client (setelah connect WireGuard): `curl -I https://google.com`; kalau sudah benar, ini juga bisa.
- Di server: `sudo iptables -t nat -L POSTROUTING -n -v` (lihat rule MASQUERADE).

---

## Ringkasan perintah (ganti subnet & interface)

```bash
# 1. Forwarding
sudo sysctl -w net.ipv4.ip_forward=1
echo 'net.ipv4.ip_forward=1' | sudo tee -a /etc/sysctl.conf

# 2. NAT (ganti 10.0.0.0/24 dan eth0)
sudo iptables -t nat -A POSTROUTING -s 10.0.0.0/24 -o eth0 -j MASQUERADE

# 3. Simpan iptables (Debian/Ubuntu)
sudo apt install -y iptables-persistent
sudo netfilter-persistent save
```

Setelah itu, client yang pakai `AllowedIPs = 0.0.0.0/0` akan internet lewat server.
