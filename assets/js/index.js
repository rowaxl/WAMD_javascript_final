const ERROR_MESSAGE = {
  '400': 'Invalid request. Please check query again.',
  '401': 'You are unauthorized. Please set your API KEY first.',
  '404': 'Cannot find the show. Please check if id is valid.',
  '503': 'Internal Error occured. Please wait a moment and try again.',
}

const detailURL = 'pages/details.html'
const posterBaseURL = 'https://image.tmdb.org/t/p/'
const aspects = {
  small: 'w300_and_h450',
  large: 'w600_and_h900',
}


$(() => {
  // variables and selectors
  let API_KEY = '';
  const resultCard = $('#results');
  const resultText = $('#result-text');
  const resultList = $('#result-list');

  const inputKey = $('#input-key');
  const buttonSave = $('#btn-save-key');

  const favourited = localStorage.getItem('fav-shows') ? JSON.parse(localStorage.getItem('fav-shows')) : [];

  // functions
  async function loadShows() {
    const result = await getShows()
      .catch((error) => {
        console.error(error)
        return renderError(error.status);
      });

    if (!result) return;

    renderResults(result);
  }

  function handleFavourite() {
    const target = $(this).data('show-id')

    console.log(target)
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

  function renderResults(results) {
    resultCard.removeClass('hide');
    resultList.empty();

<<<<<<< HEAD:index.js
    resultText.text(`${results.length} programs found:`);
=======
    results.forEach(show => {
      const showItem = $(`<li></li>`);
>>>>>>> 77a47cc0d7a8e92c611d7d65870a6230c5462fdf:assets/js/index.js

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
                  ${show.name}
                </h4>
<<<<<<< HEAD:index.js
                <h5 class="card-subtitle my-2"><span class="material-icons">
                trending_up
                </span>${tv.voteAverage}</h5>
=======

                <div id="score-container" class="card-text">
                  <h6 class="score-label">User Scores</h6>
                  <div class="score-indicator">
                    <svg>
                      <g>
                        <circle cx="0" cy="0" r="20" stroke="black" class="animated-circle" transform="translate(50,50) rotate(-90)" data-score=${show.voteAverage * 0.1} />
                      </g>
                      <g>
                        <circle cx="0" cy="0" r="38" transform="translate(50,50) rotate(-90)" />
                      </g>
                    </svg>
                    <div class="score-count">${show.voteAverage * 10}</div>
                  </div>
                </div>
>>>>>>> 77a47cc0d7a8e92c611d7d65870a6230c5462fdf:assets/js/index.js
              </div>
            </div>

            <button class="fav-btn btn rounded-circle ${show.isFavourite ? 'favored' : ''}" data-show-id="${show.id}">
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

  function renderError(errorStatus) {
    const errorMessage = ERROR_MESSAGE[errorStatus] ? ERROR_MESSAGE[errorStatus] : 'Unknown error occured. Please wait and try again later.';
    resultCard.removeClass('hide');
    resultText.text(errorMessage);
    resultText.addClass('text-danger');
    resultList.empty();
  }

  function getShows(query) {
    const url = `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}`

    return new Promise((resolve, reject) => {
      $.ajax({
        url,
        dataType: 'json',
        success: (res) => {
          resolve(sanitizeBookData(res.results));
        },
        error: (res) => {
          reject(res)
        }
      })
    })
  }

  function renderPercentage() {
    const circle = $('.animated-circle');
    const circle_offset = 126 * parseFloat(circle.data('score'));
    circle.css({ "stroke-dashoffset": 126 - circle_offset });
  }

  function isFavourited(id) {
    return favourited.includes(id)
  }

  function sanitizeBookData(data) {
    let tvs = []
    try {
      tvs = data.map(tv => ({
        id: tv.id,
        name: tv.name,
        posterPath: tv.poster_path,
        voteAverage: tv.vote_average,
        isFavourite: isFavourited(tv.id)
      }))
    } catch (e) {
      console.error(e)
    }
    return tvs
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
  loadShows();

  // event listeners
  buttonSave.on('click', saveAPIKey);
})