# WireGuard Client: Perbaikan "Temporary failure in name resolution"

Kalau di **client** (mesin yang pakai interface WireGuard, mis. `wg0-client` di mastenarserver) muncul:
```text
ping google.com
ping: google.com: Temporary failure in name resolution
```
artinya **DNS tidak jalan** — traffic mungkin sudah lewat tunnel, tapi resolusi nama gagal.

---

## Penyebab

Saat tunnel aktif dengan `AllowedIPs = 0.0.0.0/0`, semua traffic (termasuk DNS) lewat tunnel. Kalau di client **tidak ada DNS** yang di-set untuk interface WireGuard, sistem pakai DNS lama (mis. dari DHCP) yang bisa tidak terjangkau atau tidak cocok.

---

## Perbaikan di client (mastenarserver / mesin dengan wg0-client)

### 1. Tambah DNS di config WireGuard

Edit config client (nama interface dari `wg` — di contoh kamu: `wg0-client`):

```bash
sudo nano /etc/wireguard/wg0-client.conf
```

Di bagian **[Interface]** (bukan [Peer]), tambah baris **DNS**:

```ini
[Interface]
PrivateKey = ...
Address = 10.8.0.x/24
DNS = 1.1.1.1
# atau: DNS = 1.1.1.1, 8.8.8.8
```

Simpan (Ctrl+O, Enter, Ctrl+X).

### 2. Restart tunnel

```bash
sudo wg-quick down wg0-client
sudo wg-quick up wg0-client
```

Atau pakai perintah yang biasa dipakai untuk nyalakan tunnel (systemd, NetworkManager, dll).

### 3. Cek

```bash
ping google.com
cat /etc/resolv.conf
```

`resolv.conf` seharusnya berisi `nameserver 1.1.1.1` (atau 8.8.8.8) saat tunnel aktif.

---

## Alternatif: set DNS manual (tanpa edit config)

Kalau tidak mau pakai `DNS = ...` di config, bisa set manual **setelah** tunnel up:

```bash
# Sementara (sampai reboot / restart tunnel)
echo 'nameserver 1.1.1.1' | sudo tee /etc/resolv.conf
# atau
echo 'nameserver 8.8.8.8' | sudo tee /etc/resolv.conf
```

Lalu tes: `ping google.com`.

---

## Ringkasan

| Lokasi   | Yang dilakukan |
|----------|-----------------|
| **Server** (156.230.184.120) | IP forward + NAT (script `wireguard-server-internet.sh`) — sudah dijalankan. |
| **Client** (mastenarserver, wg0-client) | Tambah `DNS = 1.1.1.1` di `[Interface]` config WireGuard, lalu restart tunnel. |

Setelah DNS di client benar, `ping google.com` dan browsing dari client seharusnya jalan.
