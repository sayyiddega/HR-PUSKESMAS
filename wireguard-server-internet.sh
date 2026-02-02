#!/bin/bash
# Jalankan di WIREGUARD SERVER sebagai root: sudo bash wireguard-server-internet.sh
# Jangan simpan password di file ini.

set -e

echo "=== WireGuard Server: Aktifkan internet untuk client ==="

# 1. IP forwarding
echo "[1/4] Mengaktifkan IP forwarding..."
sysctl -w net.ipv4.ip_forward=1
if grep -q '^net.ipv4.ip_forward=1' /etc/sysctl.conf 2>/dev/null; then
  echo "  (sudah ada di sysctl.conf)"
else
  echo 'net.ipv4.ip_forward=1' >> /etc/sysctl.conf
  echo "  (ditambah ke sysctl.conf)"
fi

# 2. Deteksi interface keluar ke internet
DEFAULT_IF=$(ip route show default 2>/dev/null | awk '/default/ {print $5}' | head -1)
if [ -z "$DEFAULT_IF" ]; then
  echo "  ERROR: Tidak ada default route. Cek: ip route show default"
  exit 1
fi
echo "[2/4] Interface keluar: $DEFAULT_IF"

# 3. Deteksi subnet WireGuard dari wg0.conf
WG_CONF="/etc/wireguard/wg0.conf"
if [ -f "$WG_CONF" ]; then
  # Address di [Interface] biasanya 10.x.x.1/24 -> subnet 10.x.x.0/24
  WG_ADDR=$(grep -A 20 '^\[Interface\]' "$WG_CONF" | grep '^Address' | head -1 | awk '{print $3}')
  if [ -n "$WG_ADDR" ]; then
    # 10.0.0.1/24 -> 10.0.0.0/24
    SUBNET=$(echo "$WG_ADDR" | sed 's|\.[0-9]*/|.0/|')
    echo "[3/4] Subnet WireGuard: $SUBNET (dari $WG_CONF)"
  else
    SUBNET="10.0.0.0/24"
    echo "[3/4] Subnet WireGuard: $SUBNET (default, sesuaikan jika beda)"
  fi
else
  SUBNET="10.0.0.0/24"
  echo "[3/4] Subnet WireGuard: $SUBNET (default, file $WG_CONF tidak ada)"
fi

# 4. NAT masquerade
echo "[4/4] Menambah rule iptables NAT..."
if iptables -t nat -C POSTROUTING -s "$SUBNET" -o "$DEFAULT_IF" -j MASQUERADE 2>/dev/null; then
  echo "  (rule sudah ada)"
else
  iptables -t nat -A POSTROUTING -s "$SUBNET" -o "$DEFAULT_IF" -j MASQUERADE
  echo "  Rule ditambah: -s $SUBNET -o $DEFAULT_IF -j MASQUERADE"
fi

# Simpan iptables jika ada
if command -v netfilter-persistent &>/dev/null; then
  netfilter-persistent save 2>/dev/null && echo "  iptables disimpan (netfilter-persistent)" || true
elif [ -d /etc/iptables ]; then
  iptables-save > /etc/iptables/rules.v4 2>/dev/null && echo "  iptables disimpan ke /etc/iptables/rules.v4" || true
fi

echo ""
echo "=== Selesai. Client WireGuard seharusnya bisa internet. ==="
echo "  Cek: iptables -t nat -L POSTROUTING -n -v"
