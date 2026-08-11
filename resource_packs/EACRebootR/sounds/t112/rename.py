import os

def rename_files_in_directory(old_name, new_name, file_extension):
    """
    Mengganti bagian tertentu dari nama file dengan ekstensi tertentu 
    dalam direktori yang sama dengan skrip ini.
    """
    
    # Dapatkan direktori tempat skrip ini dijalankan
    current_directory = os.path.dirname(os.path.abspath(__file__))
    
    print(f"Mencari file '{file_extension}' di direktori: {current_directory}")
    print("-" * 30)

    # Inisialisasi penghitung
    renamed_count = 0
    
    # Iterasi melalui semua item (file/folder) dalam direktori
    for filename in os.listdir(current_directory):
        # Cek apakah item tersebut adalah file DAN memiliki ekstensi yang diinginkan
        if os.path.isfile(os.path.join(current_directory, filename)) and filename.lower().endswith(file_extension.lower()):
            
            # Cek apakah nama file mengandung 'old_name' yang ingin diganti
            if old_name.lower() in filename.lower():
                
                # Buat nama file baru dengan mengganti 'old_name' menjadi 'new_name'
                # Menggunakan replace() yang peka terhadap kapitalisasi (case-sensitive) 
                # pada nama file aslinya, tapi pengecekan awal kita sudah fleksibel.
                new_filename = filename.replace(old_name, new_name)
                
                # Buat path lengkap untuk kedua file
                old_path = os.path.join(current_directory, filename)
                new_path = os.path.join(current_directory, new_filename)
                
                try:
                    # Lakukan proses rename
                    os.rename(old_path, new_path)
                    print(f"✅ Berhasil: '{filename}' diganti menjadi '{new_filename}'")
                    renamed_count += 1
                except Exception as e:
                    # Tangani error jika terjadi masalah saat rename
                    print(f"❌ Gagal me-rename '{filename}': {e}")
            # else:
            #     print(f"⏩ Lewati: '{filename}' tidak mengandung '{old_name}'")

    print("-" * 30)
    print(f"Proses selesai. Total {renamed_count} file berhasil diganti namanya.")
    if renamed_count == 0:
        print("Pastikan nama yang dicari (fable) sudah benar dan peka terhadap kapitalisasi!")

# --- Pengaturan Utama ---
# Nama yang ingin dicari/diganti
OLD_PART = "ss2" 

# Nama pengganti
NEW_PART = "t112" 

# Ekstensi file yang ditargetkan
FILE_EXT = ".ogg" 

# Jalankan fungsi
rename_files_in_directory(OLD_PART, NEW_PART, FILE_EXT)