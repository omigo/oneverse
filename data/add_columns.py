import pandas as pd
import random

# Read the CSV file
df = pd.read_csv('data/data.csv')

# Function to generate random values ensuring likes > comments > shares
def generate_values(likes):
    comments = random.randint(100, min(3000, likes - 1))
    shares = random.randint(100, min(3000, comments - 1))
    return comments, shares

# Add new columns
df['comments'], df['shares'] = zip(*df['likes'].apply(generate_values))

# Save the modified DataFrame back to CSV
df.to_csv('data/data.csv', index=False) 