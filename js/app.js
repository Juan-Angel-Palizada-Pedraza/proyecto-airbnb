async function searchAirbnb() {
  const city = document.getElementById('cityInput').value;
  const url = `https://airbnb19.p.rapidapi.com/api/v1/searchPropertyByLocationV2?location=${city}&totalRecords=10&currency=USD&adults=1`;

  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': '71c12a3b25msh06bb95e714c0870p1dfc9cjsn417031a50923',
      'x-rapidapi-host': 'airbnb19.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    displayResults(data.data.list);
  } catch (error) {
    console.error(error);
    document.getElementById('results').innerHTML = '<p>Error al cargar propiedades.</p>';
  }
}

function displayResults(properties) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = ''; // Limpiar resultados anteriores

  properties.forEach((item) => {
    const listing = item.listing;
    const picture = listing.contextualPictures[0].picture;
    const rating = listing.avgRatingLocalized || 'Sin calificación';
    const city = listing.city;

    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${picture}" alt="Imagen de propiedad">
      <h3>${city}</h3>
      <p>Calificación: ${rating}</p>
    `;
    resultsDiv.appendChild(card);
  });
}
