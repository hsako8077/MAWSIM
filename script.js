/* script.js */

// ページ読み込み時に実行
window.onload = function() {
  // YOUR_SCRIPT_URL を実際のURLに置き換えてください
  fetch('https://script.google.com/macros/s/AKfycbyYg8FZYopp9ywpZ-IhKpEmQNX32KuoEMe4tuMlkiPtuUK-MGoyHjfX6gH8CWmJZU1n/exec?action=getProducts')
    .then(response => response.json())
    .then(data => {
      initializeAutocomplete(data);
    })
    .catch(error => {
      console.error('製品リストの取得中にエラーが発生しました:', error);
    });
};

function initializeAutocomplete(productList) {
  const productNameInput = document.getElementById('productName');
  let currentFocus = -1;

  productNameInput.addEventListener('input', function(e) {
    const inputValue = this.value.toUpperCase();
    closeAllLists();
    if (!inputValue) { return false; }
    currentFocus = -1;
    const listElement = document.createElement('div');
    listElement.setAttribute('id', this.id + 'autocomplete-list');
    listElement.setAttribute('class', 'autocomplete-items');

    for (let i = 0; i < productList.length; i++) {
      if (productList[i].toUpperCase().indexOf(inputValue) > -1) {
        const item = document.createElement('div');
        item.innerHTML = "<strong>" + productList[i].substr(0, inputValue.length) + "</strong>";
        item.innerHTML += productList[i].substr(inputValue.length);
        item.innerHTML += "<input type='hidden' value='" + productList[i] + "'>";
        
        item.addEventListener('click', function(e) {
          productNameInput.value = this.getElementsByTagName('input')[0].value;
          closeAllLists();
        });
        listElement.appendChild(item);
      }
    }
    this.parentNode.appendChild(listElement);
  });

  productNameInput.addEventListener('keydown', function(e) {
    let x = document.getElementById(this.id + 'autocomplete-list');
    if (x) x = x.getElementsByTagName('div');
    if (e.keyCode == 40) {
      currentFocus++;
      addActive(x);
    } else if (e.keyCode == 38) {
      currentFocus--;
      addActive(x);
    } else if (e.keyCode == 13) {
      e.preventDefault();
      if (currentFocus > -1 && x) {
        x[currentFocus].click();
      }
    }
  });

  function addActive(x) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    x[currentFocus].classList.add('autocomplete-active');
  }

  function removeActive(x) {
    for (let item of x) {
      item.classList.remove('autocomplete-active');
    }
  }

  function closeAllLists(elmnt) {
    let x = document.getElementsByClassName('autocomplete-items');
    for (let item of x) {
      if (elmnt != item && elmnt != productNameInput) {
        item.parentNode.removeChild(item);
      }
    }
  }

  document.addEventListener('click', function(e) {
    closeAllLists(e.target);
  });
}

// 以下に handleFormSubmit 関数を追加
function handleFormSubmit(event) {
  event.preventDefault();

  const formData = {
    date: document.getElementById('date').value,
    productName: document.getElementById('productName').value,
    operation: document.getElementById('operation').value,
    quantity: document.getElementById('quantity').value,
    receiptAmount: document.getElementById('receiptAmount').value,
    remarks: document.getElementById('remarks').value
  };

  const errorMessageDiv = document.getElementById('errorMessage');
  const successMessageDiv = document.getElementById('successMessage');

  errorMessageDiv.textContent = '';
  errorMessageDiv.style.display = 'none';
  successMessageDiv.style.display = 'none';

  google.script.run.withSuccessHandler(function(result) {
    successMessageDiv.textContent = result;
    successMessageDiv.style.display = 'block';
    document.getElementById('stockForm').reset();
  })
  .withFailureHandler(function(error) {
    errorMessageDiv.textContent = 'エラーが発生しました: ' + error.message;
    errorMessageDiv.style.display = 'block';
  })
  .processForm(formData);
}
