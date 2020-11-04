const ERROR_MESSAGE = {
  '400': 'Invalid request. Please check query again.',
  '401': 'You are unauthorized. Please set your API KEY first.',
  '404': 'Cannot find the show. Please check if id is valid.',
  '503': 'Internal Error occured. Please wait a moment and try again.',
  'No favorites': 'There\'re no favorited show. You should add favorite shows first.',
}

const detailURL = 'details.html'
const posterBaseURL = 'https://image.tmdb.org/t/p/'
const aspects = {
  small: 'w533_and_h300',
  large: 'w1066_and_h600',
}

$(() => {
  // variables and selectors
  let API_KEY = '';
  const resultCard = $('#results');
  const resultText = $('#result-text');
  const resultList = $('#result-list');

  const inputKey = $('#input-key');
  const buttonSave = $('#btn-save-key');

  const favorited = localStorage.getItem('fav-shows') ? JSON.parse(localStorage.getItem('fav-shows')) : [];

  // functions
  function handleFavourite() {
    const target = $(this).data('show-id')
    const index = favorited.findIndex(id => id === target)

    if (index > -1) {
      favorited.splice(index, 1);
      $(this).removeClass('favored');
    } else {
      favorited.push(target);
      $(this).addClass('favored');
    }

    localStorage.setItem('fav-shows', JSON.stringify(favorited));

    loadFavored();
  }

  function renderResults(results) {
    resultCard.removeClass('hide');
    resultList.empty();
    resultText.text(`${results.length} Shows favorited:`);

    results.forEach(show => {
      const showItem = $(`<li></li>`);

      const smlImgURL = show.posterPath ? `${posterBaseURL}${aspects.small}_bestv2/${show.posterPath}` : 'https://via.placeholder.com/533x300.png/fff/?text=Image+Not+Found';
      const lrgImgURL = show.posterPath ? `${posterBaseURL}${aspects.large}_bestv2/${show.posterPath}` : 'https://via.placeholder.com/1066x600.png/fff/?text=Image+Not+Found';

      showItem
        .attr('id', show.id)
        .addClass('list-group-item')
        .html(`
        <div class="card border-none">
          <div class="row no-gutters">
            <div id="show-img-container" class="col-lg-5 col-12 card-img">
              <a href=${detailURL}?id=${show.id} taget="_blank">
                <picture>
                  <source media="(min-width: 768px)" srcset="${lrgImgURL}">
                  <img src="${smlImgURL}">
                </picture>
              </a>
            </div>
            <div class="col-sm-7">
              <div class="card-body">
                <h4 class="card-title mr-4">
                  ${show.title}
                </h4>

                <div id="score-container" class="card-text">
                  <h6 class="score-label">User Scores</h6>
                  <div class="score-indicator">
                    <svg>
                      <g>
                        <circle cx="0" cy="0" r="20" stroke="black" class="animated-circle" transform="translate(50,50) rotate(-90)" data-score=${show.votes.avg * 0.1} />
                      </g>
                      <g>
                        <circle cx="0" cy="0" r="38" transform="translate(50,50) rotate(-90)" />
                      </g>
                    </svg>
                    <div class="score-count">${show.votes.avg * 10}</div>
                  </div>
                </div>
              </div>
            </div>

            <button class="fav-btn btn rounded-circle favored" data-show-id="${show.id}">
              <svg width = "1em" height = "1em" viewBox = "0 0 16 16" class= "bi bi-heart-fill" fill = "currentColor" xmlns = "http://www.w3.org/2000/svg" >
                <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
              </svg>
            </button>
          </div>
        </div>
        `)

      resultList.append(showItem);
    })

    $('.fav-btn').unbind().click(handleFavourite);
    renderPercentage();
  }

  function renderPercentage() {
    const circle = $('.animated-circle');
    const circle_offset = 126 * parseFloat(circle.data('score'));
    circle.css({ "stroke-dashoffset": 126 - circle_offset });
  }

  function renderError(errorStatus) {
    const errorMessage = ERROR_MESSAGE[errorStatus] ? ERROR_MESSAGE[errorStatus] : 'Unknown error occured. Please wait and try again later.';
    resultCard.removeClass('hide');
    resultText.text(errorMessage);
    resultText.addClass('text-danger');
    resultList.empty();
  }

  async function loadFavored() {
    if (favorited.length < 1) return renderError('No favorites');

    const results = await Promise.all(favorited.map(id => getShowDetail(id)));

    renderResults(results)
  }

  function getShowDetail(id) {
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

  function sanitizeShowDetail(res) {
    return ({
      id: res.id,
      title: res.name,
      posterPath: res.backdrop_path,
      votes: {
        avg: res.vote_average,
      }
    })
  }

  function saveAPIKey() {
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

  // execute when page loaded
  loadAPIKey();
  loadFavored();

  // event listeners
  buttonSave.on('click', saveAPIKey);
})