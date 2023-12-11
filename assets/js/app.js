const cl = console.log;

let postContainer = document.getElementById("postContainer");
let postform = document.getElementById("postform");
let updtbtn = document.getElementById("updtbtn");
let submtbtn = document.getElementById("submtbtn");
let titleControl = document.getElementById("title");
let bodyControl = document.getElementById("body");
let userIdControl = document.getElementById("userId");
let loader = document.getElementById("loader");


let baseUrl = `https://js-crud-post-default-rtdb.asia-southeast1.firebasedatabase.app`
let postUrl = `${baseUrl}/posts.json`

const objtoArr = obj => {
    let arr = [];
    for(const key in obj){
        let data = obj[key];
        data.id = key;
        arr.push(data)
    }
    return arr;
}

const onAddpost = eve => {
    eve.preventDefault();
    let newobj = {
        title : titleControl.value,
        body: bodyControl.value,
        userId: userIdControl.value
    };
    loader.classList.remove("d-none");
    fetch(postUrl, {
        method : "POST",
        body: JSON.stringify(newobj),
        headers: {
            'content-type': 'application/json'
        }
    })
    .then(res => {
        loader.classList.add("d-none")
        return res.json();
    })
    .then(res => {
        newobj.id = res.name;
        postobjtemplating(newobj);
        Swal.fire({
            icon: "success",
            title: `Post has been added successfully`,
            timer: 1500
          });
    })
    .catch(error => cl(error))
    .finally(() => {
        eve.target.reset()
    })
}

const onDelete = eve => {
    let deleteid = eve.closest('.card').id;
    let deleteUrl = `${baseUrl}/posts/${deleteid}.json`;
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
            loader.classList.remove("d-none");
            fetch(deleteUrl, {
                method: "delete",
                headers: {
                    'content-type': 'application/json'
                }
            })
            .then(res => {
                loader.classList.add('d-none')
                return res.json();
            })
            .then(res => {
                document.getElementById(deleteid).parentNode.remove();
                Swal.fire({
                    title: "Deleted!",
                    text: "Your file has been deleted.",
                    icon: "success",
                    timer: 1000
                  });
            })
            .catch(error => cl(error))
            .finally(()=>{
                updtbtn.classList.add("d-none");
                submtbtn.classList.remove("d-none");
                postform.reset();
            })
        }
      });       
}

const onEdit = eve => {
    let editId = eve.closest('.card').id;
    localStorage.setItem("editId", editId);
    let editUrl = `${baseUrl}/posts/${editId}.json`;
    loader.classList.remove("d-none");
    fetch(editUrl)
        .then(res => {
            loader.classList.add("d-none");
            return res.json();
        })
        .then(res => {
            titleControl.value = res.title;
            bodyControl.value = res.body;
            userIdControl.value = res.userId;
            scrollToTop()
        })
        .catch(error => cl(error))
        .finally(()=>{
            submtbtn.classList.add('d-none');
            updtbtn.classList.remove('d-none');
        })
}

const onUpdate = () => {
    loader.classList.remove("d-none");
    let updtid = localStorage.getItem("editId");
    let updtUrl = `${baseUrl}/posts/${updtid}.json`
    let updtdobj = {
        title: titleControl.value,
        body: bodyControl.value,
        userId: userIdControl.value,
        id: updtid
    }
    loader.classList.add("d-none");
    Swal.fire({
        title: "Do you want to save the changes?",
        showDenyButton: true,
        confirmButtonText: "Save",
        denyButtonText: `Don't save`
      }).then((result) => {
        if (result.isConfirmed) {
            loader.classList.remove("d-none");
            fetch(updtUrl, {
                method: "PUT",
                body: JSON.stringify(updtdobj),
                headers: {
                    'content-type' : 'application/json',
                }
            })
            .then(res => {
                loader.classList.add("d-none");
                return res.json()
            })
            .then(res => {
                let childcards = [...document.getElementById(res.id).children];
                childcards[0].innerHTML = `<h2>${res.title}</h2>`;
                childcards[1].innerHTML = `<p>${res.body}</p>`;
            })
            .catch(err => cl(err))
            .finally(() => {
                updtbtn.classList.add("d-none");
                submtbtn.classList.remove("d-none");
                postform.reset()
            })
          Swal.fire("Updated Successfully!", "", "success");
        } else if (result.isDenied) {
          Swal.fire("Changes are not saved", "", "info");
            updtbtn.classList.add("d-none");
            submtbtn.classList.remove("d-none");
            postform.reset()
        }
      });
    
}
let postobjtemplating = eve => {
        let card = document.createElement('div');
        card.className = 'col-md-4';
        card.innerHTML = `
                        <div class="card box2" id="${eve.id}">
                            <div class="card-header">
                                <h2>${eve.title}</h2>
                            </div>
                            <div class="card-body overflow-auto">
                                <p>${eve.body}</p>
                            </div>
                            <div class="card-footer d-flex justify-content-between">
                                <button class="btn btn-outline-success" onclick="onEdit(this)"><strong>Edit</strong></button>
                                <button class="btn btn-outline-danger" onclick="onDelete(this)"><strong>Delete</strong></button>
                            </div>
                        </div>
                    ` 
        postContainer.prepend(card);     
}

loader.classList.remove("d-none");
fetch(postUrl)// it return its own promise 
    .then(res => {
        loader.classList.add("d-none");
        //cl(res)//consumed fetchpromise which has json method in which it
        //also return promise 
        //cl(res.json);//return promise after consuming in res will get our respective data.
        return res.json()
    })
    .then(res => {
        let data = objtoArr(res);
        data.forEach(ele => postobjtemplating(ele))
    })
    .catch(err => {
        cl(err)
    })

postform.addEventListener("submit", onAddpost);
updtbtn.addEventListener('click', onUpdate);

function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }