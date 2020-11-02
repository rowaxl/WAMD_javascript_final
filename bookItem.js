const ERROR_MESSAGE = {
  '400': 'Invalid format. Please change it to YYYY-MM-DD format or empty.',
  '401': 'You are unauthorized. Please set your API KEY first.',
  '503': 'Internal Error occured. Please wait a moment and try again.',
}

$(() => {
  let API_KEY = null;
  const buttonSave = $('#btn-save-key');
  const resultDetail = $('#result-detail');
  const resultText = $('#result-text');
  const titleSpan = $('#book-title')

  const query = new URLSearchParams(window.location.search)

  const id = query.get('id');
  const title = query.get('title');
  titleSpan.text(title);

  function getDetails() {
    const url = `https://www.googleapis.com/books/v1/volumes/${id}?key=${API_KEY}`

    return new Promise((resolve, reject) => {
      $.ajax({
        url,
        dataType: 'json',
        success: (res) => {
          resolve(sanitizeBookDetail(res.volumeInfo));
        },
        error: (res) => {
          reject(res)
        }
      })
    })
  }

  function sanitizeBookDetail(data) {
    return ({
      title: data.title,
      authors: data.authors.join(', '),
      publishedDate: data.publishedDate,
      description: data.description,
      averageRating: data.averageRating,
      ratingsCount: data.ratingsCount,
      imageLinks: data.imageLinks
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

  async function loadDetails() {
    const detail = await getDetails().catch(error => {
      console.error(error)
      renderError(error.status);
    });

    if (detail) renderDetail(detail);
  }

  function renderDetail(detail) {
    resultText.empty();

    console.log(detail.imageLinks)

    const bookDetail = $('<div></div>');
    bookDetail
      .addClass('row no-gutters')
      .html(`
        <div class="col-sm-5">
          <picture class="card-img">
            <source media="(min-width: 650px)" srcset="${detail.imageLinks.medium}">
            <source media="(min-width: 465px)" srcset="${detail.imageLinks.thumbnail}">
            <img src="${detail.imageLinks.large}">
          </picture>
        </div>
        <div class="col-sm-7">
          <div class="card-body">
            <h4 class="card-title mr-4">
              ${detail.title}
            </h4>
            <h5 class="card-subtitle my-2">${detail.authors}</h5>
            <h5 class="card-subtitle my-2">${detail.publishedDate}</h5>
            <div class="card-text">${detail.description ? detail.description : ''}</div>
          </div>
        </div>
      `)

    resultDetail.append(bookDetail)
  }

  function renderError(errorStatus) {
    const errorMessage = ERROR_MESSAGE[errorStatus] ? ERROR_MESSAGE[errorStatus] : 'Unknown error occured. Please wait and try again later.';
    resultText.text(errorMessage);
    resultText.addClass('text-danger');
  }

  // execute when page loaded
  loadAPIKey();
  loadDetails();

  buttonSave.on('click', saveAPIKey);
})