import os
import shutil

base_path = r'd:\Projects\lms-one'

def merge_and_delete(rel_parent, from_slug, to_slug):
    parent = os.path.join(base_path, rel_parent.replace('/', os.sep))
    src = os.path.join(parent, from_slug)
    dst = os.path.join(parent, to_slug)
    
    if not os.path.exists(src):
        print(f"Source not found: {src}")
        return
        
    print(f"Processing: {src} -> {dst}")
    
    if os.path.exists(dst):
        # Merge contents
        for root, dirs, files in os.walk(src):
            rel_path = os.path.relpath(root, src)
            target_dir = os.path.join(dst, rel_path)
            
            if not os.path.exists(target_dir):
                os.makedirs(target_dir)
                
            for file in files:
                src_file = os.path.join(root, file)
                dst_file = os.path.join(target_dir, file)
                if not os.path.exists(dst_file):
                    print(f"  Copying: {file}")
                    shutil.copy2(src_file, dst_file)
                else:
                    print(f"  Skipping (exists): {file}")
        
        # Delete source
        print(f"  Removing source: {src}")
        shutil.rmtree(src)
    else:
        # Rename
        print(f"  Renaming: {src} to {dst}")
        os.rename(src, dst)

# Targets
targets = [
    ('app/admin/courses/builder', '[courseId]', '[id]'),
    ('app/api/lms/courses', '[courseId]', '[id]'),
    ('app/api/lms/enrollment', '[courseId]', '[id]'),
    ('app/lms/learn', '[courseId]', '[id]')
]

for p, f, t in targets:
    try:
        merge_and_delete(p, f, t)
    except Exception as e:
        print(f"Error processing {p}: {e}")

print("Operations finished.")
