def get_currency_by_country(country):
    if not country:
        return "USD"
    country = country.strip().lower()
    if country in ["egypt", "eg", "مصر"]:
        return "EGP"
    return "USD"
