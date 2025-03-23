import os

def rename_to_svg(directory):
    # 遍历目录中的所有文件
    for filename in os.listdir(directory):
        # 检查文件是否是 PNG 文件
        if filename.endswith('.png'):
            # 构建新的文件名，将 .png 替换为 .svg
            new_name = filename.replace('.png', '.svg')
            # 构建完整的文件路径
            old_file = os.path.join(directory, filename)
            new_file = os.path.join(directory, new_name)
            # 重命名文件
            os.rename(old_file, new_file)
            print(f'Renamed: {filename} -> {new_name}')

# 指定目录路径
icons_dir = 'assets/icons'
rename_to_svg(icons_dir) 