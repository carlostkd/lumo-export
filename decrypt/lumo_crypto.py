import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
import os
import json

class LumoCryptoApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Lumo Chat Crypto")
        
        # Center window on screen
        screen_width = root.winfo_screenwidth()
        screen_height = root.winfo_screenheight()
        x = (screen_width - 800) // 2
        y = (screen_height - 700) // 2
        self.root.geometry(f"800x700+{x}+{y}")
        self.root.minsize(600, 500)
        self.root.resizable(True, True)
        self.root.configure(bg="#1a1a2e")

        self.file_path = tk.StringVar()
        self.output_dir = tk.StringVar()
        self.password = tk.StringVar()
        self.mode = tk.StringVar(value="decrypt")
        self.status_text = tk.StringVar(value="Ready.")

        self.setup_styles()
        self.build_ui()

    def setup_styles(self):
        style = ttk.Style()
        style.theme_use("clam")
        style.configure("Dark.TFrame", background="#1a1a2e")
        style.configure("Dark.TLabel", background="#1a1a2e", foreground="#e0e0e0", font=("Segoe UI", 11))
        style.configure("Title.TLabel", background="#1a1a2e", foreground="#ffffff", font=("Segoe UI", 22, "bold"))
        style.configure("Subtitle.TLabel", background="#1a1a2e", foreground="#6c63ff", font=("Segoe UI", 12, "bold"))
        style.configure("Status.TLabel", background="#1a1a2e", foreground="#51cf66", font=("Segoe UI", 11))
        style.configure("Error.TLabel", background="#1a1a2e", foreground="#ff6b6b", font=("Segoe UI", 11))
        style.configure("Dark.TRadiobutton", background="#1a1a2e", foreground="#e0e0e0", font=("Segoe UI", 12))
        style.map("Dark.TRadiobutton", background=[("active", "#1a1a2e")])
        style.configure("Accent.TButton", background="#6c63ff", foreground="#ffffff", font=("Segoe UI", 14, "bold"), padding=15, relief="flat", borderwidth=0)
        style.map("Accent.TButton", background=[("active", "#5a52d5"), ("pressed", "#4b42b0")])
        style.configure("Browse.TButton", background="#16213e", foreground="#e0e0e0", font=("Segoe UI", 10), padding=8, relief="flat", borderwidth=0)
        style.map("Browse.TButton", background=[("active", "#2a2a4a")])
        style.configure("Dark.TEntry", fieldbackground="#16213e", foreground="#e0e0e0", insertcolor="#e0e0e0", padding=10)

    def build_ui(self):
        canvas = tk.Canvas(self.root, bg="#1a1a2e", highlightthickness=0)
        scrollbar = ttk.Scrollbar(self.root, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas, style="Dark.TFrame", padding=30)

        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw", width=770)
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        title_frame = ttk.Frame(scrollable_frame, style="Dark.TFrame")
        title_frame.pack(fill=tk.X, pady=(0, 20))
        ttk.Label(title_frame, text="🔐 Lumo Chat Crypto", style="Title.TLabel").pack(anchor=tk.W)
        ttk.Label(title_frame, text="Securely encrypt or decrypt your chat backups locally.", style="Subtitle.TLabel").pack(anchor=tk.W, pady=(5, 0))

        mode_frame = ttk.Frame(scrollable_frame, style="Dark.TFrame")
        mode_frame.pack(fill=tk.X, pady=(15, 20))
        ttk.Label(mode_frame, text="Operation Mode:", style="Dark.TLabel").pack(side=tk.LEFT, padx=(0, 15))
        ttk.Radiobutton(mode_frame, text="Decrypt File", variable=self.mode, value="decrypt", style="Dark.TRadiobutton").pack(side=tk.LEFT, padx=(0, 20))
        ttk.Radiobutton(mode_frame, text="Encrypt File", variable=self.mode, value="encrypt", style="Dark.TRadiobutton").pack(side=tk.LEFT)

        ttk.Label(scrollable_frame, text="Input File:", style="Dark.TLabel").pack(anchor=tk.W, pady=(10, 5))
        file_frame = ttk.Frame(scrollable_frame, style="Dark.TFrame")
        file_frame.pack(fill=tk.X, pady=(0, 15))
        file_entry = ttk.Entry(file_frame, textvariable=self.file_path, style="Dark.TEntry", font=("Segoe UI", 11))
        file_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 10))
        ttk.Button(file_frame, text="Browse...", style="Browse.TButton", command=self.browse_file).pack(side=tk.RIGHT)

        ttk.Label(scrollable_frame, text="Password (Min 8 chars):", style="Dark.TLabel").pack(anchor=tk.W, pady=(10, 5))
        pass_entry = ttk.Entry(scrollable_frame, textvariable=self.password, style="Dark.TEntry", show="●", font=("Segoe UI", 12))
        pass_entry.pack(fill=tk.X, pady=(0, 15))

        ttk.Label(scrollable_frame, text="Output Directory:", style="Dark.TLabel").pack(anchor=tk.W, pady=(10, 5))
        out_frame = ttk.Frame(scrollable_frame, style="Dark.TFrame")
        out_frame.pack(fill=tk.X, pady=(0, 20))
        out_entry = ttk.Entry(out_frame, textvariable=self.output_dir, style="Dark.TEntry", font=("Segoe UI", 11))
        out_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 10))
        ttk.Button(out_frame, text="Browse...", style="Browse.TButton", command=self.browse_output).pack(side=tk.RIGHT)

        run_btn = ttk.Button(scrollable_frame, text="▶ EXECUTE OPERATION", style="Accent.TButton", command=self.run)
        run_btn.pack(fill=tk.X, ipady=15, pady=(15, 10))

        self.status_label = ttk.Label(scrollable_frame, textvariable=self.status_text, style="Status.TLabel")
        self.status_label.pack(anchor=tk.W, pady=(0, 10))

    def browse_file(self):
        if self.mode.get() == "decrypt":
            ftypes = [("Encrypted Files", "*.enc"), ("All Files", "*.*")]
        else:
            ftypes = [("JSON Files", "*.json"), ("All Files", "*.*")]
        path = filedialog.askopenfilename(filetypes=ftypes)
        if path:
            self.file_path.set(path)
            if not self.output_dir.get():
                self.output_dir.set(os.path.dirname(path))

    def browse_output(self):
        path = filedialog.askdirectory()
        if path:
            self.output_dir.set(path)

    def set_status(self, message, is_error=False):
        self.status_text.set(message)
        if is_error:
            self.status_label.configure(style="Error.TLabel")
        else:
            self.status_label.configure(style="Status.TLabel")

    def derive_key(self, password_bytes, salt):
        kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=100000)
        return kdf.derive(password_bytes)

    def decrypt_file(self, input_path, password_str, output_dir):
        with open(input_path, "rb") as f:
            data = f.read()
        if len(data) < 29:
            raise ValueError("File too small or corrupted.")
        salt = data[:16]
        iv = data[16:28]
        ciphertext = data[28:]
        key = self.derive_key(password_str.encode("utf-8"), salt)
        aesgcm = AESGCM(key)
        plaintext = aesgcm.decrypt(iv, ciphertext, None)
        basename = os.path.splitext(os.path.basename(input_path))[0]
        if basename.endswith(".json"):
            out_name = basename + ".decrypted.json"
        else:
            out_name = basename.replace("-encrypted", "") + ".json"
        out_path = os.path.join(output_dir, out_name)
        with open(out_path, "wb") as f:
            f.write(plaintext)
        return out_path

    def encrypt_file(self, input_path, password_str, output_dir):
        with open(input_path, "rb") as f:
            data = f.read()
        json.loads(data.decode("utf-8"))
        salt = os.urandom(16)
        iv = os.urandom(12)
        key = self.derive_key(password_str.encode("utf-8"), salt)
        aesgcm = AESGCM(key)
        ciphertext = aesgcm.encrypt(iv, data, None)
        package = salt + iv + ciphertext
        basename = os.path.basename(input_path)
        name_without_ext = os.path.splitext(basename)[0]
        timestamp = name_without_ext.replace("lumo-chat-export-", "")
        out_name = f"lumo-chat-encrypted-{timestamp}.json.enc"
        out_path = os.path.join(output_dir, out_name)
        with open(out_path, "wb") as f:
            f.write(package)
        return out_path

    def run(self):
        fpath = self.file_path.get().strip()
        pwd = self.password.get().strip()
        odir = self.output_dir.get().strip()
        if not fpath:
            self.set_status("Please select an input file.", True)
            return
        if not pwd:
            self.set_status("Please enter a password.", True)
            return
        if len(pwd) < 8:
            self.set_status("Password must be at least 8 characters.", True)
            return
        if not odir:
            self.set_status("Please select an output directory.", True)
            return
        if not os.path.isfile(fpath):
            self.set_status("Input file does not exist.", True)
            return
        if not os.path.isdir(odir):
            self.set_status("Output directory does not exist.", True)
            return
        try:
            if self.mode.get() == "decrypt":
                self.set_status("Decrypting...")
                self.root.update()
                out = self.decrypt_file(fpath, pwd, odir)
                self.set_status(f"✓ Success! Saved: {os.path.basename(out)}")
            else:
                self.set_status("Encrypting...")
                self.root.update()
                out = self.encrypt_file(fpath, pwd, odir)
                self.set_status(f"✓ Success! Saved: {os.path.basename(out)}")
        except Exception as e:
            err_msg = str(e)
            if "MAC check failed" in err_msg or "authentication" in err_msg.lower():
                self.set_status("❌ Wrong password or corrupted file.", True)
            elif "Expecting value" in err_msg:
                self.set_status("❌ Input must be a valid JSON file for encryption.", True)
            else:
                self.set_status(f"❌ Error: {err_msg}", True)

if __name__ == "__main__":
    root = tk.Tk()
    app = LumoCryptoApp(root)
    root.mainloop()
