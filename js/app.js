const apiKey = 'a4e5385aa1msh4bd8c9e1f2c60c2p1d10a5jsn141833259164';
const host = 'airbnb19.p.rapidapi.com';

//Tipos de propiedad
async function getPropertyTypes() {
  const url = 'https://airbnb19.p.rapidapi.com/api/v1/getPropertyType';
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': host
    }
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log('Respuesta de getPropertyTypeFilters:', JSON.stringify(data, null, 2));
    populatePropertyTypes(data.data);
  } catch (error) {
    console.error('Error al obtener tipos de propiedad:', error);
  }
}

function populatePropertyTypes(types) {
  const select = document.getElementById('propertyTypeSelect');
  types.forEach(type => {
    const option = document.createElement('option');
    option.value = type.title;
    option.textContent = type.title;
    select.appendChild(option);
  });
}

//Buscar propiedad por ciudad
async function searchAirbnb() {
  const city = document.getElementById('cityInput').value;
  const selectedType = document.getElementById('propertyTypeSelect').value;

  let url = `https://airbnb19.p.rapidapi.com/api/v1/searchPropertyByLocationV2?location=${city}&totalRecords=10&currency=USD&adults=1`;

  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': host
    }
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    const filteredList = data.data.list.filter(item => {
      if (!selectedType) return true;
      return item.listing.roomTypeCategory?.toLowerCase().includes(selectedType.toLowerCase()) ||
             item.listing.spaceType?.toLowerCase().includes(selectedType.toLowerCase()) ||
             item.listing.name?.toLowerCase().includes(selectedType.toLowerCase());
    });

    displayResults(filteredList);
  } catch (error) {
    console.error('Error al buscar propiedades:', error);
    document.getElementById('results').innerHTML = '<p>Error al cargar propiedades.</p>';
  }
}

function displayResults(properties) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = ''; 

  if (properties.length === 0) {
    resultsDiv.innerHTML = '<p>No se encontraron propiedades.</p>';
    return;
  }

  properties.forEach(item => {
    const listing = item.listing;
    const picture = listing.contextualPictures[0]?.picture || '';
    const rating = listing.avgRatingLocalized || 'Sin calificación';
    const city = listing.city || 'Sin ciudad';

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


getPropertyTypes();
