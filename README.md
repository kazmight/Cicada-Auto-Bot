 ## 🌟Cicada Auto Bot

Cicada Auto Bot adalah skrip otomatis yang dirancang untuk membantu Anda berinteraksi dengan platform kampanye Cicada Finance. Bot ini dapat secara otomatis masuk menggunakan private key Ethereum Anda, memverifikasi akun, dan mengklaim poin dari tugas-tugas kampanye. Bot ini mendukung penggunaan proxy dan dapat berputar (rotate) proxy jika diperlukan.

## ✨ Fitur
Login Otomatis: Masuk ke platform Cicada Finance menggunakan private key Ethereum Anda.
Penandatanganan Pesan SIWE (Sign-In with Ethereum): Menangani proses penandatanganan pesan untuk otentikasi.
Klaim Tugas Otomatis: Mengklaum poin dari tugas-tugas yang tersedia di kampanye Cicada.
Dukungan Proxy: Opsi untuk menjalankan bot dengan proxy (pribadi atau gratis dari Proxyscrape) untuk menyembunyikan alamat IP Anda.
Rotasi Proxy: Secara otomatis mengganti proxy jika koneksi saat ini bermasalah.
Tampilan Log Bersih: Output terminal yang minimalis, hanya menampilkan informasi penting seperti alamat dompet dan status tugas.
Waktu Tunggu Interaktif: Menampilkan hitung mundur waktu tunggu antar siklus pemrosesan akun.

## Join telegram channel Dasar Pemulung.
## Link telegram: https://t.me/dasarpemulung

## 1. Klone Repository:
```bash
git clone https://github.com/kazmight/Cicada-Auto-Bot
cd cicada-auto-bot
```

## 2. Instal dependensi:
```bash
npm install axios ethers socks-proxy-agent @noble/hashes
```

## 🚀 Penggunaan

accounts.txt: Buat file ini di dalam folder proyek Anda.

Setiap baris di file ini harus berisi satu private key Ethereum Anda.
Contoh:
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
proxy.txt (Opsional): Buat file ini di dalam folder proyek Anda jika Anda akan menggunakan proxy pribadi.

Setiap baris di file ini harus berisi satu alamat proxy (misalnya, http://user:pass@ip:port atau socks5://ip:port).
Contoh:
http://192.168.1.1:8080
socks5://user:pass@myproxy.com:9050
Jika Anda memilih opsi "Run With Proxy", file ini akan dibuat/diperbarui secara otomatis.
Jalankan bot:


## 3. Jalankan bot dengan perintah:
```Bash
node index.js
```
Bot akan memulai dan meminta Anda untuk memilih opsi penggunaan proxy. Ikuti instruksi di terminal.


⚠️ Catatan Penting
Keamanan Private Key: Simpan file accounts.txt Anda dengan sangat aman. Siapa pun yang memiliki private key Anda dapat mengakses dompet Anda. Jangan pernah membagikannya secara publik atau di repositori GitHub.
Penggunaan Proxy: Penggunaan proxy sangat disarankan untuk menghindari pemblokiran IP, terutama jika Anda menjalankan banyak akun.
Perubahan API: API platform Cicada Finance mungkin berubah di masa mendatang, yang bisa membuat bot ini tidak berfungsi. Pembaruan mungkin diperlukan jika hal itu terjadi.
Gunakan dengan Bertanggung Jawab: Gunakan bot ini sesuai dengan syarat dan ketentuan platform Cicada Finance.

🤝 Kontribusi
Jika Anda ingin berkontribusi pada proyek ini, silakan buat fork repositori, buat cabang fitur, dan kirimkan pull request.

📜 Lisensi
Ini adalah proyek sumber terbuka dan tersedia di bawah Lisensi MIT.
