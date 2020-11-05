const ERROR_MESSAGE = {
  '400': 'Invalid request. Please check query again.',
  '401': 'You are unauthorized. Please set your API KEY first.',
  '404': 'Cannot find the show. Please check if id is valid.',
  '503': 'Internal Error occured. Please wait a moment and try again.',
}

const posterBaseURL = 'https://image.tmdb.org/t/p/'
const aspects = {
  small: 'w533_and_h300',
  large: 'w1066_and_h600',
}

$(() => {
  let API_KEY = null;
  const favourited = localStorage.getItem('fav-shows') ? JSON.parse(localStorage.getItem('fav-shows')) : []

  const result = $('#result');
  const buttonSave = $('#btn-save-key');
  const buttonFav = $('.fav-btn');
  const imgContainer = $('#show-img-container');
  const showTitle = $('#show-title');
  const popularity = $('#show-popular');
  const showOverview = $('#show-overview');
  const seasonCounter = $('#season-counter');
  const percentageText = $('.score-count');
  const rateCount = $('#rate-count');

  const query = new URLSearchParams(window.location.search)

  const id = query.get('id');

  function getDetails() {
    const url = `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}`

    return new Promise((resolve, reject) => {
      $.ajax({
        url,
        dataType: 'json',
        success: (res) => {
          resolve(sanitizeShowDetail(res));
        },
        error: (res) => {
          reject(res)
        }
      })
    })
  }

  function handleFavourite() {
    const target = $(this).data('show-id')
    const index = favourited.findIndex(id => id === target)

    if (index > -1) {
      favourited.splice(index, 1);
      $(this).removeClass('favored');
    } else {
      favourited.push(target);
      $(this).addClass('favored');
    }

    localStorage.setItem('fav-shows', JSON.stringify(favourited));
  }

  function isFavourited(id) {
    return favourited.includes(id)
  }

  function sanitizeShowDetail(res) {
    return ({
      id: res.id,
      title: res.name,
      posterPath: res.backdrop_path,
      firstAir: res.first_air_date.substring(0, 4),
      overview: res.overview,
      seasons: res.seasons.length,
      popularity: res.popularity,
      votes: {
        avg: res.vote_average,
        count: res.vote_count
      },
      isFavourite: isFavourited(res.id)
    })
  }

  function saveAPIKey() {
    const inputKey = $('#input-key')
    localStorage.setItem('google-api-key', inputKey.val());

    $('.modal').removeClass('show');
    $('.modal-backdrop').remove();

    loadAPIKey();
    inputKey.val('');
  }

  function loadAPIKey() {
    API_KEY = localStorage.getItem('google-api-key');

    if (API_KEY) {
      $("#btn-auth").removeClass('btn-warning').addClass('btn-success').text('Authorized')
    } else {
      $("#btn-auth").removeClass('btn-success').addClass('btn-warning').text('Authorize')
    }
  }

  async function loadDetails() {
    const detail = await getDetails().catch(error => {
      console.error(error)
      renderError(error.status);
    });

    if (!detail) return

    renderDetail(detail);
    fetchFavButtonID(detail.id);
  }

  function renderDetail(detail) {
    result.text(`The TV Show Finder`)
    showTitle.text(`${detail.title} (${detail.firstAir})`);

    const smlImgURL = detail.posterPath ? `${posterBaseURL}${aspects.small}_bestv2/${detail.img}` : 'https://via.placeholder.com/533x300.png/fff/?text=Image+Not+Found';
    const lrgImgURL = detail.posterPath ? `${posterBaseURL}${aspects.large}_bestv2/${detail.img}` : 'https://via.placeholder.com/1066x600.png/fff/?text=Image+Not+Found';

    const picture = $("<picture></picture>");
    picture.append(`<source media="(min-width: 768px)" srcset="${lrgImgURL}">`);
    picture.append(`<img src="${smlImgURL}">`);
    imgContainer.append(picture)

    showOverview.text(detail.overview);

    seasonCounter.text(`${detail.seasons} Season(s)`);

    popularity.text(`Popularity : ${detail.popularity}`);

    rateCount.text(`${detail.votes.count} Ratings`);

    percentageText.text(`${detail.votes.avg * 10}`)
    toggleFavButton(detail.isFavourite)
    renderPercentage(detail.votes.avg * 0.1);
  }

  function renderPercentage(percentage) {
    const $circ = $('.animated-circle');
    const circle_offset = 126 * percentage;
    $circ.css({ "stroke-dashoffset": 126 - circle_offset });
  }

  function renderError(errorStatus) {
    const errorMessage = ERROR_MESSAGE[errorStatus] ? ERROR_MESSAGE[errorStatus] : 'Unknown error occured. Please wait and try again later.';
    result.text(errorMessage);
    result.addClass('text-danger');
  }

  function toggleFavButton(isFav) {
    if (!isFav) return

    buttonFav.addClass('favored')
  }

  function fetchFavButtonID(id) {
    buttonFav.data('show-id', id);
  }

  // execute when page loaded
  loadAPIKey();
  loadDetails();

  buttonSave.on('click', saveAPIKey);
  buttonFav.on('click', handleFavourite);
  })
