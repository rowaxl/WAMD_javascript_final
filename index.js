const ERROR_MESSAGE = {
  '400': 'Invalid query.',
  '401': 'You are unauthorized. Please set your API KEY first.',
}

const bookItemURL = 'bookItems.html'

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

    const result = await getBookList(query)
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

    resultText.text(`${results.length} Book found:`);

    resultList.empty();

    results.forEach((book, index) => {
      const bookItem = $(`<li></li>`);
      bookItem
        .attr('id', book.isbn10)
        .addClass('list-group-item')
        .html(`
        <div class="card border-none">
          <div class="row no-gutters">
            <div class="col-sm-5">
              <a class="book-img" href="${bookItemURL}?id=${book.id}&title=${book.title}" target="_blank">
                <img class="card-img" src="${book.imageLinks.thumbnail}" alt="${book.title}">
              </a>
            </div>
            <div class="col-sm-7">
              <div class="card-body">
                <h4 class="card-title mr-4">
                  <span class="mr-2 rank-chip">#${String(index + 1).padStart(2, '0')}</span>
                  ${book.title}
                </h4>
                <h5 class="card-subtitle my-2">${book.authors}</h5>
                <div class="card-text decription">${book.description ? book.description : ''}</div>
              </div>
            </div>

            <button class="fav-btn btn rounded-circle ${book.isFavourite ? 'favored' : ''}" data-book-id="${book.id}">
              <svg width = "1em" height = "1em" viewBox = "0 0 16 16" class= "bi bi-heart-fill" fill = "currentColor" xmlns = "http://www.w3.org/2000/svg" >
                <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"/>
              </svg>
            </button>
          </div>
        </div>
        `)

      resultList.append(bookItem);
    })

    $('.fav-btn').unbind().click(handleFavourite);
  }

  function renderError(errorStatus) {
    const errorMessage = ERROR_MESSAGE[errorStatus] ? ERROR_MESSAGE[errorStatus] : 'Unknown error occured. Please wait and try again later.';
    resultCard.removeClass('hide');
    resultText.text(errorMessage);
    resultText.addClass('text-danger');
    resultList.empty();
  }

  function getBookList(query) {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&api-key=${API_KEY}`

    return new Promise((resolve, reject) => {
      $.ajax({
        url,
        dataType: 'json',
        success: (res) => {
          resolve(sanitizeBookData(res.items));
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

  function sanitizeBookData(results) {
    let books = []
    try {
      books = results.map(data => ({
        id: data.id,
        title: data.volumeInfo.title,
        authors: data.volumeInfo.authors.join(', '),
        publishedDate: data.volumeInfo.publishedDate,
        description: data.volumeInfo.description,
        imageLinks: data.volumeInfo.imageLinks,
        isFavourite: isFavourited(data.id)
      }))
    } catch (e) {
      console.error(e)
    }

    return books
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