var stream = [];
let state = { view: "PRODUCTS", pageNumber: 10, stream: stream };
var cart = JSON.parse(localStorage.getItem("cart")) || [];

function setCategory(category) {
  navLis = document.getElementsByClassName("navli");
  for (i=0;i<navLis.length;i++) {
    navLis[i].style.background = "#504429";
    navLis[i].style.color =  "#fff4e3";
  }

  console.log(category);
  if (category == "PRODUCTS") {
    document.getElementById("productsLi").style.background =  "#fff4e3";
    document.getElementById("productsLi").style.color = "rgb(118 98 67)";
  } else if (category == "QUESTIONS") {
    document.getElementById("questionsLi").style.background = "#fff4e3";
    document.getElementById("questionsLi").style.color ="rgb(118 98 67)";
  } else if (category == "CONTÂCT" || category == "CONT%C3%82CT") {
    document.getElementById("contactLi").style.background =  "#fff4e3";
    document.getElementById("contactLi").style.color = "rgb(118 98 67)";
  } else {
    document.getElementById("productsLi").style.background =  "#fff4e3";
    document.getElementById("productsLi").style.color = "rgb(118 98 67)";
  }
}

const observer = new IntersectionObserver((entries) => {
  if (entries[0].intersectionRatio <= 0) return;
  nextPage();
});


function getPage(page) {
  setCategory(page);
  window.location = window.location.origin + "/" + page;
}

function getStream(category, back) {
  console.log("categorL", category)
  // stream = [];
  state.pageNumber = 10;
  var listDiv = document.getElementById("streamOuter");
  if (state.pageNumber >= 10 && category == "PRODUCTS" && back) {
    console.log("png10");
    listDiv.innerHTML = "";
    nextPage();
  } else {
    var route = '';
    if (category === undefined) {
      category = "PRODUCTS";
    } else {
      route = category;
    }
    var xhr = new XMLHttpRequest();

    xhr.open("POST", "/api/getStream");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function() {
      if (xhr.status === 200) {
        var res = JSON.parse(xhr.responseText);
        if (res.success == "true") {
          if (!back) {
            console.log("sv: ", category);
            state.view = category;
            window.history.pushState(state, "page", "/" + route);
          }
          stream = JSON.parse(res.stream);
          listDiv.innerHTML = res.template;
          window.scrollTo(0, 0);
          document.getElementById("pageName").innerHTML = category;
          setCategory(category);
          hideSidebar();
          console.log("sl: ", stream, stream.length);
          if (stream.length) {
            console.log("sl: ", stream, stream.length);
            setButtons();
            observer.observe( document.querySelector(".footLogo"));
          } else {
            observer.unobserve(document.querySelector(".footLogo"));
          }



        } else {
          // handle error
        }
      }

    };

    // For now, all we're sending is a username and password, but we may start
    // asking for email or mobile number at some point.
    xhr.send(JSON.stringify({
      category: category
    }));
    // var sb = document.getElementById("sidebar").offsetWidth;
    // var s = document.getElementById("sizer");
    // w = (window.innerWidth - (sb)) + "px";
    // mL = (sb) + "px";
    // s.style.width = w;
    // s.style.marginLeft = mL;
  }
}

function nextPage(view) {
  var xhr = new XMLHttpRequest();

  xhr.open("POST", "/api/nextPage");
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = function() {
    if (xhr.status === 200) {
      var res = JSON.parse(xhr.responseText);
      if (res.success == "true") {
        if (res.lastPage == "true") {
          // To stop observing:
          observer.unobserve(document.querySelector(".footLogo"));
          stream.pop();
        } else {

          window.history.pushState(state, "page", "/" + state.view + "/last=" + stream.length);
          var listDiv = document.getElementById("streamOuter");
          var nextPageDiv = document.createElement("div");
          nextPageDiv.innerHTML = res.template;
          nextPageDiv.id = "page_" + stream.length;
          nextPageDiv.children[0].style.paddingTop ="0em";
          nextPageDiv.children[0].children[0].style.paddingTop ="0em";
          listDiv.appendChild(nextPageDiv);
          // listDiv.insertAdjacentHTML("beforeend", res.template);
          stream = stream.concat(JSON.parse(res.stream));
          state.pageNumber = stream.length;
          setButtons();
        }
      } else {
        // handle error
        console.log("error");
      }
    }
  };

  // For now, all we're sending is a username and password, but we may start
  // asking for email or mobile number at some point.
  xhr.send(JSON.stringify({
    number: parseInt(state.pageNumber),
    category: state.view,
  }));
}


function like(trackID, isLoggedIn) {
  if (isLoggedIn == "false") {
    showAuth();
  } else {
    var xhr = new XMLHttpRequest();

    xhr.open("POST", "/api/like");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function() {
      if (xhr.status === 200) {
        var res = JSON.parse(xhr.responseText);
        if (res.success == "false") {
          // If we aren't successful we display an error.
          document.getElementById("errorField").innerHTML = res.error;
        } else if (res.isLiked == "true") {
          document.getElementById("heart_" + trackID).style.backgroundImage = "url(/public/assets/heart_red.svg)";
        } else if (res.isLiked == "false") {
          document.getElementById("heart_" + trackID).style.backgroundImage = "url(/public/assets/heart_black.svg)";
        } else {
          // handle error
          console.log("error");
        }
      }
    };

    // For now, all we're sending is a username and password, but we may start
    // asking for email or mobile number at some point.
    xhr.send(JSON.stringify({
      id: trackID
    }));

  }
}

var expanded = [];
function expando(eid) {
  var expand = document.getElementById("post_"+eid);
  pic = document.getElementById("postImg_" + eid);
  bottompic = document.getElementById("postImgAfter_" + eid);
  bottompicInner = document.getElementById("imgBottom_" + eid);
  cartButt = document.getElementById("addToCart_" + eid);
  info = document.getElementById("postInfo_" + eid);
  description= document.getElementById("pd_" + eid);
  if (expanded.indexOf(eid) != -1) {
    expand.style.height = "unset";
    expand.style.display = "flex";
    pic.style.display = "inline-flex";
    bottompic.style.display = "none"
    bottompicInner.style.display = "none"
    info.style.paddingLeft = "1em";
    info.style.paddingBottom = "unset";
    cartButt.style.display = "unset";
    cartButt.style.float = "unset";
    description.style.display = "none";
    expanded.splice(expanded.indexOf(eid), 1);
  } else {
    expand.style.display = "revert";
    expanded.active = eid;
    bottompic.style.display = "unset"
    bottompicInner.style.display = "unset"
    pic.style.display = "none";
    info.style.paddingLeft = "unset";
    info.style.paddingBottom = "1em";
    cartButt.style.display = "inline";
    cartButt.style.float = "right";
    description.style.display = "unset";
    expanded.push(eid);
  }
}

function setButtons() {
  cart.forEach((z) => {
    for (i=0;i<stream.length;i++) {
      if (stream[i].ID == z.ID) {
        document.getElementById("addToCart_" + stream[i].ID).innerHTML = "remove";
        document.getElementById("addToCart_" + stream[i].ID).style.background = "#b96100";
        document.getElementById("addToCart_" + stream[i].ID).style.color = "#ffecec";
        break;
      }
    }
  });
}
function addToCart(ID) {
  ind = cart.findIndex(x => x.ID === ID);
  if (ind != -1) {
    // if its already in the cart
    if (cart[ind].quantity == 1) {
      cart.splice(ind, 1);
      document.getElementById("addToCart_" + ID).innerHTML = "add to cart";
      document.getElementById("addToCart_" + ID).style.background = "#9abc2e";
      document.getElementById("ciq_" + ID).innerHTML = "";
    } else {
      cart[ind].quantity = cart[ind].quantity - 1;
      document.getElementById("ciq_" + ID).innerHTML = cart[ind].quantity + " more in cart";
    }
  } else {
    // if its not in the cart
    cart.push(stream[stream.findIndex(x => x.ID === ID)]);
    cart[cart.length - 1].quantity = 1;
    document.getElementById("addToCart_" + ID).innerHTML = "remove";
    document.getElementById("addToCart_" + ID).style.background = "#b96100";
    document.getElementById("addToCart_" + ID).style.color = "#ffecec";
    document.getElementById("ciq_" + ID).innerHTML = "1 item in cart";
  }
  updateCartTotal();
}

function addQuantity(key) {
  ci = cart.indexOf(stream[key]);
  cart[ci].quantity = cart[ci].quantity + 1;
}

function removeQuantity(key) {
  if (cart[key].quantity >= 1) {
    cart[key].quantity = cart[key].quantity - 1;
  }
  if (cart[key].quantity <= 0) {
    removeItemFromCart[key];
  }
}

// Create our number formatter.
const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});




var total;
function updateCartTotal() {
  total = 0.00;
  for (i=0;i<cart.length;i++) {
    total = total + (parseFloat(cart[i].price.substring(1)) * cart[i].quantity);
  }

  total = formatter.format(total);
  document.getElementById("cartButt").innerHTML = total;
  // if (parseFloat(total.substring(1)) <= 0) {
  //   document.getElementById("cartButt").style.display = "none";
  // } else {
  //   document.getElementById("cartButt").style.display = "unset";
  // }
  localStorage.setItem("cart", JSON.stringify(cart));      
}

function removeItemFromCart(key) {
  console.log("rfc: ", key)
  streamDiv = document.getElementById("streamOuter");
  streamDiv.innerHTML = "";
  cart.splice(key, 1);
  updateCartTotal();
  newCart = buildCartMarkup();
  streamDiv.appendChild(newCart);
  // document.getElementById("cartTotal").innerHTML = "Checkout: " + total;
  // document.getElementById("cartItem_" + key).remove();
}

function buildCartMarkup() {
  cartDiv = document.createElement("div");
  cartDiv.className = "cartDiv";
  cartDiv.id = "cartDiv";
  cartTotal = document.createElement("div");
  cartTotal.className = "cartTotal";
  cartTotal.id = "cartTotal";
  if (total === undefined || parseInt(total.substring(1)) <= 0) {
    cartTotal.innerHTML = "Cart Empty";
  } else {
    cartTotal.innerHTML = "Checkout: " + total;
    cartTotal.setAttribute("onclick","checkoutPage()");
    for (i=0;i<cart.length;i++) {
      cartItem = document.createElement("div");
      cartItem.className = "cartItem";
      cartItem.id = "cartItem_" + i;

      itemName= document.createElement("div");
      itemName.className = "cartItemName";
      itemName.innerHTML = cart[i].product;

      itemPrice = document.createElement("div");
      itemPrice.className = "cartItemPrice";
      itemPrice.id = "itemPrice_" + cart[i].ID;
      itemPrice.innerHTML = formatter.format(
        parseFloat(cart[i].price.substring(1)) * parseInt(cart[i].quantity)
      );

      remove = document.createElement("div");
      remove.className = "removeFromCartButt";
      remove.innerHTML = "x";
      remove.setAttribute("onclick","removeItemFromCart(" + i + ")");

      select = document.createElement("select");
      select.className = "quantity";
      select.id = "quantity_" + cart[i].ID;
      select.setAttribute("onchange","updateQuantity(" + i + ")");
      for (j=0;j<cart[i].stocked;j++) {
        option = document.createElement("option");
        option.value = j + 1;
        option.innerHTML = j + 1;
        select.appendChild(option);
      }

      select.selectedIndex = cart[i].quantity - 1;
      cartItem.appendChild(itemName);
      cartItem.appendChild(select);
      cartItem.appendChild(itemPrice);
      cartItem.appendChild(remove);

      cartDiv.appendChild(cartItem);
    }
  }
  cartDiv.appendChild(cartTotal);
  return cartDiv;
}

function checkoutPage() {
  window.location = window.location.origin + "/checkout";
}

function updateQuantity(key) {
  var selectBox = document.getElementById("quantity_" + cart[key].ID);
  var selectedValue = selectBox.options[selectBox.selectedIndex].value;

  cart[key].quantity = selectedValue;

  var itemPrice = document.getElementById("itemPrice_" + cart[key].ID);
  itemPrice.innerHTML = formatter.format(
    parseFloat(cart[key].price.substring(1)) * selectedValue
  );

  updateCartTotal();
  cartTotal = document.getElementById("cartTotal");
  cartTotal.innerHTML = "Checkout: " + total;
}


function toggleCart() {
  pageName = document.getElementById("pageName");
  streamDiv = document.getElementById("streamOuter");
  streams = document.getElementsByClassName("stream");
  if (pageName.innerHTML == "Cart") {
    for (i=0;i<streams.length; i++) {
      streams[i].style.display = 'revert';
    }
    pageName.innerHTML = "PRODUCTS";
    document.getElementById("cartDiv").remove();
    state.pageNumber = stream.length;
    state.view = "PRODUCTS";
    window.history.pushState(state, "page", "/PRODUCTS");

    observer.observe( document.querySelector(".footLogo"));
  } else {
    observer.unobserve(document.querySelector(".footLogo"));
    for (i=0;i<streams.length; i++) {
      streams[i].style.display = 'none';
    }
    cartDiv = buildCartMarkup();
    state.view = "CART";
    window.history.pushState(state, "page", "/cart");
    pageName.innerHTML = "Cart";
    streamDiv.appendChild(cartDiv);
    window.scrollTo(0, 0);
  }
}

window.onpopstate = function (event) {
  if (event.state) {
    state = event.state;
  }
  console.log(state);
  getStream(state.view, true); // See example render function in summary below
};

