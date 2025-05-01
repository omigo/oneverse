import pandas as pd
import random
import json

# Read the CSV file
df = pd.read_csv('data.csv')

# Function to generate random values ensuring likes > comments > shares
def generate_values(likes):
    collections = random.randint(100, min(3000, likes - 1))
    shares = random.randint(100, min(3000, collections - 1))
    return collections, shares

# Add new columns
df['collections'], df['shares'] = zip(*df['likes'].apply(generate_values))

# 把tags 列，按中文逗号分割，生成多个标签
df['tags'] = df['tags'].str.split('，')


# df['_id'] = df.index
# df['_openid'] = 'openid_1'
# df['_create_time'] = pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')


# 将DataFrame转换为JSON字符串
df.to_json('data_1.json', orient='records', lines=True, force_ascii=False)