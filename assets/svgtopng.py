#!/usr/local/bin/python3

# Convert SVG to PNG using Inkscape
import os
import subprocess

def convert_svg_to_png(svg_dir):
    # Create output directory if it doesn't exist
    png_dir = os.path.join(os.path.dirname(svg_dir), 'png')
    os.makedirs(png_dir, exist_ok=True)
    
    # Convert each SVG file
    for filename in os.listdir(svg_dir):
        if filename.endswith('.svg'):
            svg_path = os.path.join(svg_dir, filename)
            png_path = os.path.join(png_dir, filename.replace('.svg', '.png'))
            
            try:
                # Use Inkscape to convert SVG to PNG
                cmd = ['inkscape', '--export-type=png', '--export-filename=' + png_path, svg_path]
                subprocess.run(cmd, check=True)
                print(f"Converted {filename} to PNG")
            except Exception as e:
                print(f"Error converting {filename}: {str(e)}")

if __name__ == "__main__":
    icons_dir = "assets/icons"
    if os.path.exists(icons_dir):
        convert_svg_to_png(icons_dir)
    else:
        print(f"Error: {icons_dir} directory not found")
