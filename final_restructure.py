import os
import shutil

app_path = r'd:\Projects\lms-one\app'
locale_path = os.path.join(app_path, '[locale]')

if not os.path.exists(locale_path):
    os.makedirs(locale_path)

dirs_to_move = [
    'admin', 'career-paths', 'courses', 'dashboard', 
    'internships', 'jobs', 'lms', 'login', 'register'
]

for d in dirs_to_move:
    src = os.path.join(app_path, d)
    dst = os.path.join(locale_path, d)
    if os.path.exists(src) and os.path.isdir(src):
        if os.path.exists(dst):
            print(f"Target already exists: {dst}, skipping.")
            continue
        try:
            shutil.move(src, dst)
            print(f"Moved directory {d}")
        except Exception as e:
            print(f"Error moving {d}: {e}")

# Also move page.tsx and layout.tsx if they still exist in root app
for f in ['page.tsx', 'layout.tsx']:
    src = os.path.join(app_path, f)
    dst = os.path.join(locale_path, f)
    if os.path.exists(src) and os.path.isfile(src):
        if os.path.exists(dst):
            os.remove(src) # Already created it with write_to_file probably
            print(f"Removed redundant root {f}")
        else:
            shutil.move(src, dst)
            print(f"Moved file {f}")
