#!/bin/bash
# Cek konfigurasi WireGuard SERVER — jalankan di server: sudo bash wireguard-server-cek.sh
# Kalau client bisa ping server tapi gak bisa internet, masalah biasanya di server: IP forward atau NAT.

set -e

echo "=============================================="
echo "  WireGuard Server — Cek Konfigurasi"
echo "=============================================="
echo ""

# 1. IP forwarding
echo "[1] IP forwarding (harus 1)"
FORWARD=$(cat /proc/sys/net/ipv4/ip_forward 2>/dev/null || echo "?")
if [ "$FORWARD" = "1" ]; then
  echo "    net.ipv4.ip_forward = $FORWARD  OK"
else
  echo "    net.ipv4.ip_forward = $FORWARD  GAGAL — jalankan: sudo sysctl -w net.ipv4.ip_forward=1"
fi
echo ""

# 2. Default route / interface keluar
echo "[2] Interface keluar ke internet"
DEFAULT_IF=$(ip route show default 2>/dev/null | awk '/default/ {print $5}' | head -1)
if [ -z "$DEFAULT_IF" ]; then
  echo "    Tidak ada default route. Cek: ip route show default"
else
  echo "    Interface: $DEFAULT_IF"
  ip route show default
fi
echo ""

# 3. Config WireGuard server & subnet
WG_CONF="/etc/wireguard/wg0.conf"
echo "[3] Config WireGuard server ($WG_CONF)"
if [ ! -f "$WG_CONF" ]; then
  echo "    File tidak ada. Pastikan WireGuard server pakai wg0.conf."
else
  echo "    Isi [Interface] (Address, ListenPort):"
  sed -n '/^\[Interface\]/,/^\[Peer\]/p' "$WG_CONF" | grep -E '^\s*(Address|ListenPort)' | sed 's/^/      /'
  WG_ADDR=$(grep -A 20 '^\[Interface\]' "$WG_CONF" | grep '^Address' | head -1 | awk '{print $3}')
  if [ -n "$WG_ADDR" ]; then
    SUBNET=$(echo "$WG_ADDR" | sed 's|\.[0-9]*/|.0/|')
    echo "    Subnet untuk NAT: $SUBNET"
  else
    SUBNET="10.8.0.0/24"
    echo "    Subnet (default): $SUBNET"
  fi
fi
echo ""

# 4. Rule NAT iptables (MASQUERADE)
echo "[4] Rule iptables NAT (POSTROUTING)"
if ! command -v iptables &>/dev/null; then
  echo "    iptables tidak ditemukan."
else
  if iptables -t nat -L POSTROUTING -n -v 2>/dev/null | grep -q MASQUERADE; then
    echo "    Rule MASQUERADE ada:"
    iptables -t nat -L POSTROUTING -n -v 2>/dev/null | grep -E 'MASQUERADE|Chain' | sed 's/^/      /'
  else
    echo "    Tidak ada rule MASQUERADE — client tidak bisa internet."
    echo "    Contoh perbaikan (ganti SUBNET dan INTERFACE):"
    echo "      sudo iptables -t nat -A POSTROUTING -s ${SUBNET:-10.8.0.0/24} -o ${DEFAULT_IF:-eth0} -j MASQUERADE"
    echo "    Atau jalankan: sudo bash wireguard-server-internet.sh"
  fi
fi
echo ""

# 5. Port 51820 UDP (WireGuard)
echo "[5] WireGuard ListenPort (51820/udp)"
if command -v ss &>/dev/null; then
  if ss -ulnp 2>/dev/null | grep -q 51820; then
    echo "    Port 51820 UDP listening  OK"
    ss -ulnp 2>/dev/null | grep 51820 | sed 's/^/      /'
  else
    echo "    Port 51820 tidak listening. Cek: sudo wg show"
  fi
else
  echo "    (ss tidak ada, lewati)"
fi
echo ""

# 6. Firewall (ufw) — forward policy
if [ -f /etc/default/ufw ]; then
  echo "[6] UFW forward policy"
  if grep -q 'DEFAULT_FORWARD_POLICY="ACCEPT"' /etc/default/ufw 2>/dev/null; then
    echo "    DEFAULT_FORWARD_POLICY=ACCEPT  OK"
  else
    echo "    DEFAULT_FORWARD_POLICY belum ACCEPT — forwarded traffic bisa diblok."
    echo "    Perbaikan: echo 'DEFAULT_FORWARD_POLICY=\"ACCEPT\"' | sudo tee -a /etc/default/ufw && sudo ufw reload"
  fi
else
  echo "[6] UFW tidak terdeteksi (lewati)"
fi
echo ""

echo "=============================================="
echo "  Ringkasan"
echo "=============================================="
echo "  Kalau [1] atau [4] gagal, client tidak bisa internet."
echo "  Jalankan di server: sudo bash wireguard-server-internet.sh"
echo "  Lalu di client: ping 8.8.8.8 dan curl -I https://google.com"
echo ""
