const books = [];
const RENDER_EVENT = "render-books";
const SAVED_EVENT = "saved-books";
const STORAGE_KEY = "Book-Shelf";

// Event untuk merender perubahan pada element buku
document.addEventListener(RENDER_EVENT, function() {
    console.log(books);
    const content = document.getElementById('daftar-buku');
    content.innerHTML = '';
    const baca = document.getElementById('yang-belum-selesai');
    baca.innerHTML = '';
    const selesai = document.getElementById('sudah-selesai');
    selesai.innerHTML = '';
    

    for(const booksItem of books) {
        const bookElement = makeBooks(booksItem);
        if(booksItem.selesai) {
            selesai.append(bookElement);
        } else if(booksItem.baca){
            baca.append(bookElement);
        } else {
            content.append(bookElement);
        }
        
    }
});

document.addEventListener(SAVED_EVENT, function() {
    console.log(localStorage.getItem(STORAGE_KEY));
});


// Membuat Container dengan id daftar-buku menjadi halaman yang pertama kali di munculkan
let default_container = 'daftar-buku';
function showContainer(containerId) {
    const allContents = document.querySelectorAll('.container-col');
    allContents.forEach(content => {
        content.style.display = 'none';
    });

    document.getElementById(containerId).style.display = 'block';
}

// Event untuk merender ketika web pertama kali dijalankan
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form');
    if(isStorageExist()) {
        loadDataFromStorage();
    }
    if(books.length > 0) {
        showContainer(default_container);
    } 

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        addBooks();
    });
});

// Navigasi
const navLinks = document.querySelectorAll('.container-header a');
navLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();
        const targetId= link.getAttribute('href').substring(1);

        const allContents = document.querySelectorAll('.container-col');
        allContents.forEach(content => {
            content.style.display = 'none';
        });

        document.getElementById(targetId).style.display = 'block';
    });
});




// Membuat id acak berdasarkan tanggal
function generateId() {
    return + new Date();
}

// Membuat object buku
function generateBooksObject(id,judul,deskripsi,baca,selesai) {
    return {
        id,
        judul,
        deskripsi,
        baca,
        selesai
    }
}

// Menambahkan value dari form ke dalam object
function addBooks() {
    Swal.fire({
        title: "Selamat !",
        text: "Anda Berhasil menambahkan buku baru ",
        confirmButtonColor: "#FF9800",
        icon: "success"
      }).then(() => {
        const title = document.getElementById('judul').value;
        const deskripsi = document.getElementById('deskripsi').value;
        const form = document.getElementById('form');
    
        const generateID = generateId();
        const booksObject = generateBooksObject(generateID,title,deskripsi,false,false);
        books.push(booksObject);
        form.reset();

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
      });
    
}

// Membuat card book
function makeBooks(booksObject) {
    const content = document.createElement('div');
    content.classList.add('container-content');

    const title = document.createElement('div');
    title.classList.add('container-title');

    const description = document.createElement('div');
    description.classList.add('container-description');

    const action = document.createElement('div');
    action.classList.add('container-button');

    const judul = document.createElement('h2');
    judul.innerText = booksObject.judul;
    const deskripsi = document.createElement('p');
    deskripsi.innerText = booksObject.deskripsi;
   

     if(booksObject.baca) {
        const buttonBaca = document.createElement('button');
        buttonBaca.classList.add('btn-baca');
        buttonBaca.innerHTML = '<i class="bi bi-arrow-right-square-fill"></i>';
        buttonBaca.addEventListener('click', function() {
            selesaibaca(booksObject.id);
        });
    action.append(buttonBaca);
    } else if(booksObject.selesai) {
        const buttonselesai = document.createElement('button');
        buttonselesai.classList.add('btn-selesai');
        buttonselesai.innerHTML = '<i class="bi bi-check-circle"></i>';
        buttonselesai.addEventListener('click', function() {
            kembalikerak(booksObject.id);
        });
    action.append(buttonselesai);
    } else {
        const buttonTambahkerak = document.createElement('button');
        buttonTambahkerak.classList.add('btn-tambah');
        buttonTambahkerak.innerHTML = '<i class="bi bi-bookmark-check"></i>';


        const buttonHapusBuku = document.createElement('button');
        buttonHapusBuku.classList.add('btn-hapus');
        buttonHapusBuku.innerHTML = '<i class="bi bi-trash"></i>';

        buttonTambahkerak.addEventListener('click', function() {
            tambahbacaan(booksObject.id);
        });
        buttonHapusBuku.addEventListener('click', function() {
            hapusbuku(booksObject.id);
        });
        action.append(buttonTambahkerak,buttonHapusBuku);
    }
   
    title.append(judul);
    description.append(deskripsi);
    content.append(title,action,description);
   

    content.setAttribute('id', `books-${booksObject.id}`);
    return content;
}

// Mencari id buku 
function findId(bookId) {
    for(const bookItem of books) {
        if(bookItem.id === bookId) {
            return bookItem;
        }
    }

    return null;
}

function findIdIndex(bookId) {
    for(const index in books) {
        if(books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

// untuk menambahkan buku ke rak yang belum selesai dibaca
function tambahbacaan(bookId) {
    const book = findId(bookId);
    

    if(book == null) return;

    Swal.fire({
        title: "Selamat Membaca!",
        confirmButtonColor: "#FF9800",
        icon: "success"
      }).then(() => {

          book.baca = true;
          document.dispatchEvent(new Event(RENDER_EVENT));
      
          saveData();
      });

}

// Untuk menambahkan buku kedalam rak yang sudah selesai dibaca
function selesaibaca(bookId) {
    const book = findId(bookId);

    if(book == null)return;
    Swal.fire({
        title: "Selamat !",
        text: "Anda sudah menyelesaikan bacaan anda ",
        confirmButtonColor: "#FF9800",
        icon: "success"
      }).then(() => {
        
        book.selesai = true;
        book.baca = false;
    
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
      });
}

// Menghapus buku
function hapusbuku(bookId) {
    const buku = findIdIndex(bookId);

    if(buku == null)return;

    Swal.fire({
        title: "Yakin ingin hapus?",
        text: "Kamu akan menghapus buku ini !",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#FF9800",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, hapus!"
      }).then((result) => {
        if (result.isConfirmed) {
            books.splice(buku,1);
          document.dispatchEvent(new Event(RENDER_EVENT));
          saveData();

          Swal.fire({
            title: "Terhapus!",
            text: "Berhasil menghapus Buku",
            confirmButtonColor: "#FF9800",
            icon: "success"
          });
        }
      });

     
    
}

// Mengembalikan ke rak daftar buku
function kembalikerak(bookId) {
    const buku = findId(bookId);

    if(buku == null)return;

    Swal.fire({
        title: "Berhasil !",
        text: "Mengembalikan buku kedalam rak",
        confirmButtonColor: "#FF9800",
        icon: "success"
      }).then(() => {

          buku.selesai = false;
          buku.baca = false;
      
          document.dispatchEvent(new Event(RENDER_EVENT));
          saveData();
      });
}

// Melakukan set item di dalam localStorage berdasarkan object yang sudah dibuat dan di convert menjadi string
function saveData() {
    if(isStorageExist()) {
        const parse = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY,parse);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

// Melakukan pengecekan apakah website support localStorage
function isStorageExist() {
    if(typeof(Storage) === undefined) {
        alert('Browser tidak mendukung localstorage');
        return false;
    }

    return true;
}

// Meload data dari localStorage
function loadDataFromStorage() {
    const getdata = localStorage.getItem(STORAGE_KEY);
    const data = JSON.parse(getdata);

    if(data !== null ) {
        for(const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}


