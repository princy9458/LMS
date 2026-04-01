import os

root_dir = r'd:\Projects\lms-one\app'

for root, dirs, files in os.walk(root_dir, topdown=False):
    for name in dirs + files:
        if 'courseId' in name:
            full_path = os.path.join(root, name)
            new_path = full_path + "_disabled"
            try:
                print(f"Renaming {full_path} to {new_path}")
                os.rename(full_path, new_path)
            except Exception as e:
                print(f"Failed to rename {full_path}: {e}")
