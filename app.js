import { sendData, getData, API } from "./functions.js";

document.addEventListener("DOMContentLoaded", () => {
    AOS.init({ once: true });

    const db_URL = API;
    const msg = document.querySelector("textarea");
    const comments = document.querySelector("#commentsDiv");
    const btns = document.querySelectorAll(".btn");
    const alert = document.querySelector("#alert");
    const search = document.querySelector("#search");
    const cr = document.querySelector("#copyright");
    const [btn1, btn2] = btns;
    const elems = [search, btn2];

    const todoFunc = {
        show(value, cb) {
            const template = document.querySelector("template").content.cloneNode(true);
            template.querySelector(".boxAll").setAttribute("data-aos", "fade-in");
            template.querySelector("#second").innerText = value.trim();
            cb(template);
            comments.append(template);
        },
        id(template1, value) {
            return template1.querySelector("#first").innerText = value;
        },
        check(value) {
            if(value) {
                alert.style.display = "none";
                cr.style.display = "block";
                btn2.setAttribute("style", "opacity: 1; visibility: visible");
                search.setAttribute("style", "opacity: 1; visibility: visible");
            }
        },
        checkIfDuplicate(value) {
            const elems = [...document.querySelectorAll(".boxAll")];
            if(elems.filter(item => item.querySelector("#second").innerText.split("\n").join("") == value.querySelector("#second").innerText.split("\n").join("")).length > 0) {
                let timeouted = false;
                if(timeouted == false) {
                    timeouted = true;
                    fetch(db_URL + `/${value.querySelector(".boxAll").querySelector("#first").innerText.split(" ")[1].split(":").join("")}`, {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" }
                    })
                    value.querySelector(".boxAll").remove();
                    alert.innerText = "This TODO exists!";
                    alert.style.display = "block";
                }
            }
        },
        changeText() {
            alert.innerText = "NO TODOS";
            alert.style.display = "block";
        }
    }

    btn1.addEventListener("click", () => {
        const elems = [...document.querySelectorAll(".boxAll")];
        const inputValue = msg.value.replace(/[^\x00-\x7F]/g, "").split("").join("");
        if (inputValue.length > 0 && inputValue.split(" ").join("") != "") {
            search.value = null;
            sendData(db_URL, { msg: inputValue })
            .then(data => data.json())
            .then(res => todoFunc.show(inputValue, template => {
                msg.value = null;
                template.querySelector(".boxAll").setAttribute("data-aos", "");
                (elems.length > 0) ? search.disabled = false : search.disabled = true;
                elems.filter(item => item.style.getPropertyValue("display") == "none").forEach(item => item.style.setProperty("display", "block"));
                todoFunc.id(template, `TODO ${res.id}:`);
                todoFunc.check(template);
                todoFunc.checkIfDuplicate(template);
            })).catch(err => console.log(`${err.message}.\nError while sending the data.`));
        }
    });

    getData(db_URL, res => {
        cr.style.display = "block";
        todoFunc.changeText();
        res.filter(item => item != undefined).forEach(item => {
            todoFunc.show(item.msg, template => {
                todoFunc.id(template, `TODO ${item.id}:`);
                todoFunc.check(template);
                const elems = [...document.querySelectorAll(".boxAll")];
                (elems.length > 0) ? search.disabled = false : search.disabled = true;
            });
        });
    }).catch(err => console.log(`${err.message}.\nError while getting the data.`));

    btn2.addEventListener("click", () => {
        const box = [...document.querySelectorAll(".boxAll")];
        const id = [...document.querySelectorAll("#first")];
        const tab = [];
        for(let i = 0; i < id.length; i++) tab.push(id[i].innerText.split(" ")[1].split(":").join(""));
        let index1 = 0, index2 = 0, index3 = 0;
        const interval = () => {
            if(tab[index1] != undefined) {
                elems.forEach(item => item.setAttribute("style", "opacity: 0; visibility: hidden"));
                btn2.disabled = true;
                fetch(db_URL + `/${tab[index1++]}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" }
                }).catch(err => console.log(`${err.message}.\nError while deleting all data.`));
                if(index1 == tab.length) {
                    setTimeout(() => {
                        if(document.querySelectorAll(".boxAll").length > 1) btn2.setAttribute("style", "opacity: 0; visibility: hidden");
                        btn2.disabled = false;
                        clearInterval(interval);
                    }, 300);
                }
                box[index3++].style.opacity = 0;
                setTimeout(() => {
                    box[index2++].remove();
                    const elems = [...document.querySelectorAll(".boxAll")];
                    if(elems.length == 0) {
                        btn2.setAttribute("style", "opacity: 0; visibility: hidden");
                        search.setAttribute("style", "opacity: 0; visibility: hidden");
                        todoFunc.changeText();
                    }
                }, 300);
            }
        }
        interval();
        setInterval(interval, 300);
    });

    comments.addEventListener("click", e => {
        if (e.target.id == "delete") {
            search.value = null;
            const count = e.target.closest("#todo").querySelector("#first").innerText.split(" ")[1].split(":").join("");
            const el = e.target.closest(".boxAll");
            el.style.opacity = 0;
            setTimeout(() => {
                el.remove();
                const elems1 = [...document.querySelectorAll(".boxAll")];
                if(elems1.length == elems1.filter(item => item.style.getPropertyValue("display") == "none").length) {
                    elems1.filter(item => item.style.getPropertyValue("display") == "none").forEach(item => item.style.setProperty("display", "block"));
                    alert.style.display = "none";
                    btn2.setAttribute("style", "opacity: 1; visibility: visible");
                }
                if(elems1.length == 0) {
                    todoFunc.changeText();
                    elems.forEach(item => item.setAttribute("style", "opacity: 0; visibility: hidden"));
                }
                (elems1.length > 1) ? search.disabled = false : search.disabled = true;
            }, 300);
            fetch(API + `/${count}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            }).catch(err => console.log(`${err.message}.\nError while deleting data.`));
        } else if(e.target.id == "second") {
            const count = e.target.closest("#todo").querySelector("#first").innerText.split(" ")[1].split(":").join("");
            const inner = e.target.innerText;
            const closest = e.target.closest("#box");
            const input = document.createElement("textarea");
            input.id = "edit";
            input.placeholder = "Edit content:";
            input.value = inner;
            function add(value) {
                input.remove();
                const newEl = document.createElement("div");
                newEl.id = "second";
                newEl.title = "EDIT";
                newEl.innerText = value;
                closest.append(newEl);
            }
            input.addEventListener("keydown", e => {
                if(e.key === "Escape" && input.value.length > 1) {
                    add(input.value.trim());
                    if(input.value != inner) {
                        fetch(db_URL + `/${count}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ msg: input.value })
                        }).catch(err => console.log(`${err.message}.\nError while changing the data.`));
                    }
                }
            });
            e.target.parentElement.append(input);
            let clicked = false;
            const create = value => {
                value.id = "second";
                value.title = "EDIT";
                value.innerText = inner;
            }
            msg.addEventListener("click", () => {
                if(clicked == false && input.value == e.target.innerText) {
                    clicked = true;
                    const newEl = document.createElement("div");
                    create(newEl);
                    document.querySelectorAll("#edit").forEach(item => item.remove());
                    closest.append(newEl);
                } else if(clicked == false && input.value != e.target.innerText) {
                    const newEl = document.createElement("div");
                    create(newEl);
                    document.querySelectorAll("#edit").forEach(item => item.remove());
                    if(closest.querySelectorAll("#second").length != 1) closest.append(newEl);
                }
            });
            e.target.remove();
        } else if(e.target.id == "clone") {
            sendData(db_URL, { msg: e.target.closest("#todo").querySelector("#second").innerText })
            .then(data => data.json())
            .then(res => todoFunc.show(e.target.closest("#todo").querySelector("#second").innerText, template => {
                todoFunc.id(template, `TODO ${res.id}:`);
                comments.append(template);
                const elems1 = [...document.querySelectorAll(".boxAll")];
                (elems1.length > 1) ? search.disabled = false : search.disabled = true;
            }));
        }
    });

    search.addEventListener("input", () => {
        const elems = [...document.querySelectorAll(".boxAll")];
        for (const el of elems) {
            const text = el.querySelector("#second").innerText.split("\n").join(" ");
            if(text.includes(search.value)) {
                alert.style.display = "none";
                btn2.setAttribute("style", "opacity: 1; visibility: visible");
                el.style.setProperty("display", "block");
                const algorithm = elems.length == elems.filter(item => item.style.getPropertyValue("display") == "block").length;
                if(algorithm == false) btn2.setAttribute("style", "opacity: 0; visibility: hidden");
            } else {
                todoFunc.changeText();
                btn2.setAttribute("style", "opacity: 0; visibility: hidden");
                el.style.setProperty("display", "none");
                if(elems.find(item => item.style.getPropertyValue("display") == "block")) {
                    btn2.setAttribute("style", "opacity: 0; visibility: hidden");
                    alert.style.display = "none";
                }
            }
        }
    });
    
});
