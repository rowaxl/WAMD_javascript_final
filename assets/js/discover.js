const ERROR_MESSAGE = {
    '400': 'Invalid query.',
    '401': 'You are unauthorized. Please set your API KEY first.',
    '404': 'Cannot find the show. Please check if id is valid.',
    '503': 'Internal Error occured. Please wait a moment and try again.',
}

const detailURL = 'details.html'
const posterBaseURL = 'https://image.tmdb.org/t/p/'
const aspects = {
    small: 'w300_and_h450',
    large: 'w600_and_h900',
}

$(() => {
    // variables and selectors
    let API_KEY = '';
    const searchForm = $('#form-search-show');
    const searchInput = $ ('#search-query');
    const resultCard = $('#results');
    const resultText = $('#result-text');
    const resultList = $('#result-list');
    const sortItems = $('.sort-item');

    const inputKey = $('#input-key');
    const buttonSave = $('#btn-save-key');

    const favourited = localStorage.getItem('fav-shows') ? JSON.parse(localStorage.getItem('fav-shows')) : [];

    // functions
    async function searchTvs(e) {
        e.preventDefault();

        const query = searchInput.val() ? searchInput.val() : 2020;

        const result = await getTvList(query)
            .catch((error) => {
                console.error(error)
                return renderError(error.status);
            });

        if (!result) return;

        renderResults(result);
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

    function renderResults(results) {
        resultCard.removeClass('hide');
        resultList.empty();
        resultText.removeClass('text-danger');

        resultText.text(`${results.length} Tv found:`);

        results.forEach(data => {
            const showItem = $(`<li></li>`);

            const smlImgURL = data.img ? `${posterBaseURL}${aspects.small}_bestv2/${data.img}` : 'https://via.placeholder.com/300x450.png/fff/?text=Image+Not+Found';
            const lrgImgURL = data.img ? `${posterBaseURL}${aspects.large}_bestv2/${data.img}` : 'https://via.placeholder.com/600x900.png/fff/?text=Image+Not+Found';

            showItem
                .attr('id', data.id)
                .addClass('list-group-item')
                .html(`
                <div class="card border-none">
                <div class="row no-gutters">
                    <div id="show-img-container" class="col-lg-5 col-12 card-img">
                        <a href=${detailURL}?id=${data.id} target="_blank">
                            <picture>
                                <source media="(min-width: 768px)" srcset="${lrgImgURL}">
                                <img src="${smlImgURL}">
                            </picture>
                        </a>
                    </div>
                    <div class="col-sm-7">
                        <div class="card-body">
                            <h4 class="card-title mr-4">
                                ${data.name}
                            </h4>
                        <div id="score-container" class="card-text">
                            <h6 class="score-label">User Scores</h6>
                            <div class="score-indicator">
                                <svg>
                                    <g>
                                        <circle cx="0" cy="0" r="20" stroke="black" class="animated-circle" transform="translate(50,50) rotate(-90)" data-score=${data.voteAverage * 0.1} />
                                    </g>
                                    <g>
                                        <circle cx="0" cy="0" r="38" transform="translate(50,50) rotate(-90)" />
                                    </g>
                                </svg>
                                <div class="score-count">${data.voteAverage * 10}</div>
                            </div>
                        </div>
                        </div>
                    </div>
        
                    <button class="fav-btn btn rounded-circle ${data.isFavourite ? 'favored' : ''}" data-show-id="${data.id}">
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

    function getTvList(query, sortBy = 'popularity.desc') {
        const url = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=${sortBy}&first_air_date_year=${query}&page=1&timezone=America%2FNew_York&include_null_first_air_dates=false`
        return new Promise((resolve, reject) => {
            $.ajax({
                url : url,
                dataType: 'json',
                success: (res) => {
                    resolve(sanitizeTvData(res.results));
                },
                error: (res) => {
                    reject(res)
                }
            })
        })
    }

    async function sortShows() {
        const sortBy = $(this).data('sort-by');

        const query = searchInput.val() ? searchInput.val() : 2020;

        const result = await getTvList(query, sortBy)
            .catch((error) => {
                console.error(error)
                return renderError(error.status);
            });

        if (!result) return;

        renderResults(result);
    }

    function isFavourited(isbn) {
        return favourited.includes(isbn)
    }

    function sanitizeTvData(results) {
        let tvs = []
        try {
            tvs = results.map(data => ({
                id: data.id,
                name: data.name,
                img: data.poster_path,
                voteAverage: data.vote_average,
                isFavourite: isFavourited(data.id),
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

    // event listeners
    searchForm.on('submit', searchTvs);
    buttonSave.on('click', saveAPIKey);
    sortItems.on('click', sortShows);
})