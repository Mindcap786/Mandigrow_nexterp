import requests

def transliterate_text(text, lang_code):
    try:
        url = "https://inputtools.google.com/request"
        params = {
            "text": text,
            "itc": f"{lang_code}-t-i0-und",
            "num": 1,
            "cp": 0,
            "cs": 1,
            "ie": "utf-8",
            "oe": "utf-8"
        }
        response = requests.get(url, params=params, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data[0] == "SUCCESS" and len(data[1]) > 0:
                words = data[1]
                result = []
                for word_data in words:
                    result.append(word_data[1][0])
                return " ".join(result)
    except Exception as e:
        print("Translit error:", e)
    return text

print(transliterate_text("A1 Traders", "te"))
