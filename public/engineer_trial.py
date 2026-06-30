# ==========================================
# THE ENGINEER'S TRIAL
# A fragmented transmission was intercepted. 
# It contains 4 distinct logical blocks.
# The output of each block gives you a piece of a puzzle.
# Combine the outputs in order (1 to 4) to find your destination.
# ==========================================

# --- BLOCK 1 ---
def execute_block_1():
    # ASCII decoding
    a = [104, 116, 116, 112, 115, 58, 47, 47]
    return "".join(chr(x) for x in a)

# --- BLOCK 2 ---
def execute_block_2():
    # Hexadecimal decoding
    h = ["6c", "69", "6e", "6b", "65", "64", "69", "6e", "2e", "63", "6f", "6d"]
    return "".join(chr(int(x, 16)) for x in h)

# --- BLOCK 3 ---
def execute_block_3():
    # Base64 decoding
    import base64
    encoded = b'L2NvbXBhbnkv'
    return base64.b64decode(encoded).decode('utf-8')

# --- BLOCK 4 ---
def execute_block_4():
    # Cipher shift (offset by -1)
    word = "uddiemgb"
    result = ""
    for char in word:
        result += chr(ord(char) - 1)
    return result

# Good luck, Hacker.
