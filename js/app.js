const apiKey = 'a4e5385aa1msh4bd8c9e1f2c60c2p1d10a5jsn141833259164';
const host = 'airbnb19.p.rapidapi.com';

let currentPage = 1;
const perPage = 10;

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

async function searchAirbnb() {
  const city = document.getElementById('cityInput').value;
  const selectedType = document.getElementById('propertyTypeSelect').value;
  const minPrice = parseFloat(document.getElementById('minPrice').value) || 0;
  const maxPrice = parseFloat(document.getElementById('maxPrice').value) || Infinity;
  const minRating = parseFloat(document.getElementById('minRating').value) || 0;
  const checkIn = document.getElementById('checkIn').value;
  const checkOut = document.getElementById('checkOut').value;

  if (!city || !checkIn || !checkOut) {
    alert("Por favor ingresa ciudad, check-in y check-out.");
    return;
  }

  const offset = (currentPage - 1) * perPage;

  const url = `https://airbnb19.p.rapidapi.com/api/v1/searchPropertyByLocationV2?location=${city}&adults=1&currency=USD&totalRecords=${perPage}&offset=${offset}`;

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
      const price = parseFloat(item.pricingQuote?.rate?.amountFormatted?.replace(/[^0-9.]/g, '')) || 0;
      const rating = parseFloat(item.listing.avgRating) || 0;

      return (!selectedType || item.listing.roomTypeCategory?.toLowerCase().includes(selectedType.toLowerCase()))
        && price >= minPrice && price <= maxPrice
        && rating >= minRating;
    });

    displayResults(filteredList, checkIn, checkOut);
    document.getElementById('pageIndicator').textContent = `Página ${currentPage}`;
  } catch (error) {
    console.error('Error al buscar propiedades:', error);
    document.getElementById('results').innerHTML = '<p>Error al cargar propiedades.</p>';
  }
}

async function getCheckoutPrice(propertyId, checkIn, checkOut) {
  const url = `https://airbnb19.p.rapidapi.com/api/v1/getPropertyCheckoutPrice?propertyId=${propertyId}&currency=USD&checkIn=${checkIn}&checkOut=${checkOut}&adults=1`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': apiKey,
      'x-rapidapi-host': host
    }
  };

  try {
    const res = await fetch(url, options);
    return await res.json();
  } catch (err) {
    console.error('Error al obtener precio checkout:', err);
    return null;
  }
}

function displayResults(properties, checkIn, checkOut) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  if (properties.length === 0) {
    resultsDiv.innerHTML = '<p>No se encontraron propiedades.</p>';
    return;
  }

  properties.forEach(async item => {
    const listing = item.listing;
    const picture = listing.contextualPictures[0]?.picture || '';
    const rating = listing.avgRatingLocalized || 'Sin calificación';
    const city = listing.city || 'Sin ciudad';

    const card = document.createElement('div');
    card.className = 'card';
    const priceDivId = `price-${listing.id}`;

    card.innerHTML = `
      <img src="${picture}" alt="Imagen de propiedad">
      <h3>${city}</h3>
      <p>Calificación: ${rating}</p>
      <div id="${priceDivId}" class="checkout-price">Cargando precio...</div>
    `;

    resultsDiv.appendChild(card);

    const result = await getCheckoutPrice(listing.id, checkIn, checkOut);
    const priceDiv = document.getElementById(priceDivId);
    if (result?.status && result?.data?.price?.totalFormatted) {
      priceDiv.innerHTML = `<p><strong>Precio total:</strong> ${result.data.price.totalFormatted}</p>`;
    } else {
      priceDiv.innerHTML = `<p>No se pudo obtener el precio.</p>`;
    }
  });
}

function nextPage() {
  currentPage++;
  searchAirbnb();
}

function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    searchAirbnb();
  }
}

getPropertyTypes();
