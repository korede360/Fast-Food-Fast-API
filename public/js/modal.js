let modal = document.querySelector('.modal');
let trigger = document.querySelector('.trigger');
let closeButton = document.querySelector('.close-button');

const toggleModal = () => {
  modal.classList.toggle('show-modal');
}

const windowOnClick = (event) => {
  if (event.target === modal) {
    toggleModal();
  }
}

trigger.addEventListener('click', toggleModal);
closeButton.addEventListener('click', toggleModal);
window.addEventListener('click', windowOnClick);