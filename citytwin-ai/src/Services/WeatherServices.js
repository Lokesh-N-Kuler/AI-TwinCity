const API_KEY = "7ad1a91860d72f8ccb59378a370fd64d";

export async function getWeather() {
    const response = await fetch(
        "http://127.0.0.1:8000/api/weather/"
    );

    if (!response.ok) {
        throw new Error("Failed to fetch weather data");
    }

    return response.json();
}