const ERROR_MESSAGE = {
    '400': 'Invalid query.',
    '401': 'You are unauthorized. Please set your API KEY first.',
}

const bookItemURL = 'bookItem.html'

$(() => {
    // variables and selectors
    let API_KEY = '';
    const searchForm = $('#form-search-book');
    const searchInput = $('#search-query');
    const resultCard = $('#results');
    const resultText = $('#result-text');
    const resultList = $('#result-list');

    const inputKey = $('#input-key');
    const buttonSave = $('#btn-save-key');

    const favourited = localStorage.getItem('favourited') ? JSON.parse(localStorage.getItem('favourited')) : [];

    // functions
    async function searchBooks(e) {
        if (e) e.preventDefault();

        const query = searchInput.val();

        const result = await getTvList(query)
        .catch((error) => {
            console.error(error)
            return renderError(error.status);
        });

        if (!result) return;

        renderResults(result);

    }

    function handleFavourite() {
        const target = $(this).data('book-id')
        const index = favourited.findIndex(id => id === target)

        if (index > -1) {
        favourited.splice(index, 1);
        $(this).removeClass('favored');
        } else {
        favourited.push(target);
        $(this).addClass('favored');
        }


        localStorage.setItem('favourited', JSON.stringify(favourited));
    }

    function renderResults(results) {
        resultCard.removeClass('hide');
        resultText.removeClass('text-danger');

        resultText.text(`${results.length} Tv found:`);

        resultList.empty();

        results.forEach((data, index) => {
            const showItem = $(`<li></li>`);

            showItem

                .addClass('list-group-item')
                .html(`
                <div class="card border-none">
                    <div class="row no-gutters">
                        <div class="col-sm-5">
                            <a class="book-img" href="${bookItemURL}?id=${data.id}&title=${data.name}" target="_blank">
                                <img class="card-img" src="https://image.tmdb.org/t/p/w300_and_h450_bestv2/${data.backdrop_path}" alt="${data.name}">
                            </a>
                        </div>
                        <div class="col-sm-7">
                            <div class="card-body">
                                <h4 class="card-title mr-4">
                                <span class="mr-2 rank-chip">#${String(index + 1).padStart(2, '0')}</span>
                                ${data.name}
                                </h4>
                                <h5 class="card-subtitle my-2"><span class="material-icons">
                                trending_up
                                </span>${data.voteAverage}</h5>
                            </div>
                        </div>
                    </div>
                    
                </div>
            `)

            resultList.append(showItem);
        })

    }

    function renderError(errorStatus) {
        const errorMessage = ERROR_MESSAGE[errorStatus] ? ERROR_MESSAGE[errorStatus] : 'Unknown error occured. Please wait and try again later.';
        resultCard.removeClass('hide');
        resultText.text(errorMessage);
        resultText.addClass('text-danger');
        resultList.empty();
    }

    function getTvList(query) {
        const url = `https://api.themoviedb.org/3/discover/tv?api_key=${API_KEY}&language=en-US&sort_by=popularity.desc&first_air_date_year=${query}&page=1&timezone=America%2FNew_York&include_null_first_air_dates=false`
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

    function isFavourited(isbn) {
        return favourited.includes(isbn)
    }

    function sanitizeTvData(results) {
        let tvs = []
        try {
            tvs = results.map(data => ({
                id: data.id,
                name: data.name,
                firstAirDate: data.first_air_date,
                img: data.backdrop_path,
                voteAverage: data.vote_average
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
    searchForm.on('submit', searchBooks);

    buttonSave.on('click', saveAPIKey);
})