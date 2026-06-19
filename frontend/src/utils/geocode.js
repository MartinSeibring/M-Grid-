export async function geocodeAdresse(adresse) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(adresse)}&format=json&limit=1&addressdetails=1&accept-language=de&countrycodes=de`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding-Service nicht erreichbar');
  const data = await res.json();
  if (data.length === 0) throw new Error('Adresse nicht gefunden');
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    display: data[0].display_name,
  };
}
