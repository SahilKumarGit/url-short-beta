// alert('f')
var loadingStatus = false;
var shortUrl = ''
function loading(status = false) {
    let element = document.getElementById('loading')
    loadingStatus = status
    if (!status) element.style.display = 'none';
    else element.style.display = 'flex'
}
function error(val) {
    let element = document.getElementById('error')
    element.innerHTML = val;
}

let invalidURL = function (val) {
    let rejx = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/
    return !rejx.test(val)
}


function popup(url = null) {
    console.log(url)
    let element = document.getElementById('popup')
    let input = document.getElementById('outPut')
    if (!url) element.style.display = 'none';
    else element.style.display = 'flex'
    input.value = url
    shortUrl = url
}

popup()

loading();

function getUrl() {
    if (loadingStatus) return
    let val = document.getElementById('inp').value.trim()
    if (!val) return error('Please enter a url')
    if (invalidURL(val)) return error('Invalid url, Try again')


    // ajax here
    loading(true)
    axios.post('/url/shorten', {
        longUrl: val
    }).then(function (response) {
        loading(false)
        console.log(response);

        if (response.data.status) {
            console.log(response);
            popup(response.data.data.shortUrl)
        } else {
            alert(response.data.message)
        }

    }).catch(function (error) {
        loading(false)
        error(error.message)
    });
}


function copy() {
    navigator.clipboard.writeText(shortUrl);
}
