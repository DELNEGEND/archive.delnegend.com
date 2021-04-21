const dngndFunc = {
  speed: "normal",
  d(selector) {
    return document.querySelector(selector);
  },
  randomString(length = 20) {
    let result = '';
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return "_" + result + btoa(new Date().getTime()).replace(/=/g, "");
  },
  string2clip: function (string, elem) {
    $(elem).attr('data-clipboard-text', string);
    let tempClass = dngndFunc.randomString();
    elem.classList.add(tempClass);
    new ClipboardJS("." + tempClass);
    setTimeout(() => {
      elem.classList.remove(tempClass);
    }, 1000);
    dngndFunc.msgBox('Đã copy vào clipboard!');
  },
  msgBox(message = "Thông báo!", duration = 1000) {
    // Type: https://getbootstrap.com/docs/4.0/components/alerts/

    // Tạo 1 id tạm thời cho container thông báo, mỗi 1 noti là 1 id riêng, tránh trùng lặp với noti trước nếu 2 cái overlap nhau
    let tempID = `NotiTempID_${new Date().getTime()}`;
    // Tạo container chứa dngndFunc.msgBox nếu chưa có
    if (!$('.alert-container')[0]) {
      $("body").append(`<div class="alert-container"><div class="inneralert-container"></div></div>`);
    }
    $('.inneralert-container').append(`<div class="alert" id="${tempID}" role="alert" style="display:none">${message}</div>`);
    $(`#${tempID}`).slideDown(this.speed);
    setTimeout(() => {
      $(`#${tempID}`).slideUp(this.speed, () => $(`#${tempID}`).remove());
    }, duration);
  },
  toggleElem(elem) {
    // Source: https://stackoverflow.com/a/7435955
    let target = $(elem).attr('toggle-target'),
      status = elem.checked;
    // Fix slideToggle glitching
    if ($(target)[0].style.overflow !== 'hidden') $(target)[0].style.overflow = 'hidden';
    if ($(target).attr("prevDisplay") != "block") {
      $(target)[0].style.display = "block";
      $(target).attr("prevDisplay", "block");
      $(target).hide();
    }
    if (status) {
      $(target).slideDown(this.speed);
    } else if (!status) {
      $(target).slideUp(this.speed);
    }
    if (!this.isFirefox() && this.isFromUserAction) this.saveCheckboxStateToLocalStorage(elem);
  },
  isFromUserAction: false,
  async dlGridView(jsonpath, element) {
    if (!element) return new Error("Invalid element");
    element.classList.add("direct-link-grid-view");
    let data = await $.getJSON(jsonpath) || [];
    if (!data.length) return new Error("This", jsonfile, "is invalid or empty");
    data.forEach(elem => {
      let
        episode = elem.episode,
        poster = elem.poster || "/img/blank.jpg",
        posterWEBP = "",
        summary = "";
      if (elem.webp) posterWEBP = `<source srcset="${elem.webp}" type="image/webp">`;

      // Tên tập, nếu không có stt thì chỉ dùng tên tập
      let title = `<div class="title">${elem.title}</div>`;
      if (episode) title = `<div class="title">${episode}. ${elem.title}</div>`;

      // Gộp chung duration với filesize thành extraIn4
      let duration = elem.duration,
        size = elem.size,
        extraIn4 = "";

      if (!duration) duration = '';
      if (!size) size = '';
      if (duration && !size) extraIn4 = `<div>${duration}</div>`;
      if (size && !duration) extraIn4 = `<div>${size}</div>`;
      if (duration && size) extraIn4 = `<div>${duration}&nbsp;•&nbsp;${size}</div>`;

      if (elem.summary) summary = `<div class="custom-hr"></div><p class="epSummary">${elem.summary}</p>`;

      $(element).append(`
      <div class="an-episode">
        <div class="episode-image" onclick='dngndFunc.string2clip("${elem.url}",this)'>
          <picture>
            ${posterWEBP}
            <source srcset="${poster}" type="image/jpg">
            <img src="${poster}">
          </picture>
          <span><i class="fad fa-copy"></i></span>
        </div>
        ${title}
        ${extraIn4}
        ${summary}
      </div>
      `);
    });
  },
  async dlTableView(jsonfile, element, directOrNormal = 'normal') {
    if (!element) return new Error("Invalid element");
    let
      data = await $.getJSON(jsonfile) || [],
      output = [],
      linkType;
    if (!data.length) return new Error("This", jsonfile, "is invalid or empty");
    if (directOrNormal == "direct") linkType = "Link Direct";
    if (directOrNormal == "normal") linkType = "Link thường";
    output.push(`
      <div class=table>
        <table>
          <thead>
            <tr>
              <th>Tập</th>
              <th>Tên</th>
              <th>${linkType}</th>
            </tr>
          </thead>
          <tbody>
    `);

    let createBtn = (display, data, display2) => {
      let temp = [];
      if (directOrNormal == 'direct') {
        temp.push(`<span class="standard-btn" onclick="dngndFunc.string2clip('${data}',this)">`);
        if (!display2) temp.push(`<span class="buttonInner">${display}</span>`);
        else if (display2) temp.push(`
          <div class="buttonInnerSlide">${display}</div>
          <div class="buttonInnerAlter">${display2}</div>
        `);
        temp.push(`</span>`);
      } else if (directOrNormal == 'normal') {
        if (!display2) temp.push(`
          <a href="${data}" target="_blank" rel="noopener noreferrer">
            <div class="standard-btn">
              <div class="buttonInner">${display}</div>
            </div>
          </a>
        `);
        else if (display2) temp.push(`
          <div class="standard-btn">
            <a href="${data}" target="_blank" slide="1" rel="noreferrer noopener">
              <div class="buttonInnerSlide">${display}</div>
              <div class="buttonInnerAlter">${display2}</div>
            </a>
          </div>
      `);
      }
      return temp.join('');
    };

    for (let elem of data) {
      output.push(`
        <tr>
          <th>${elem.episode}</th>
          <td>${elem.title}</td>
      `);
      for (let i = 1; i < this.objLength(elem) - 1; i++) {
        let currEp = elem["_" + i].split("__");
        output.push('<th>');
        if (currEp.length == "2") output.push(createBtn(currEp[0], currEp[1]));
        if (currEp.length == "3") output.push(createBtn(currEp[0], currEp[2], currEp[1]));
        output.push('</th>');
      }
      output.push(`</tr>`);
    }

    output.push(`
          </tbody>
        </table>
      </div>
    `);
    element.append(this.string2Node(output.join('').replace('/[\t\n\r\s]+/g', '')));
  },
  saveCheckboxStateToLocalStorage(checkboxElem) {
    // Lấy dữ liệu object từ localStorage
    let allData = JSON.parse(localStorage.getItem('checkbox_check') || "{}"),
      // Key này là pathname của url, thay / thành _ để dùng làm key của object trên
      key = window.location.pathname.replace(/\//g, "_"),
      // Dữ liệu là array 
      data = allData[key] || [],
      checkboxCSSPath = $(checkboxElem).fullSelector();
    // Loại bỏ elem rỗng
    this.removeElemFromArr(data, "");
    // Đẩy css path của checkbox vào
    if (checkboxElem.checked && !data.includes(checkboxCSSPath)) {
      data.push(checkboxCSSPath);
    } else if (!checkboxElem.checked && data.includes(checkboxCSSPath)) {
      this.removeElemFromArr(data, checkboxCSSPath);
    }
    // Đẩy lại lên object
    allData[key] = data;
    localStorage.setItem("checkbox_check", JSON.stringify(allData));
  },
  removeElemFromArr(array, elem) {
    let index = array.indexOf(elem);
    if (index > -1) array.splice(index, 1);
  },
  recheckBoxes() {
    let a = JSON.parse(localStorage.getItem("checkbox_check")),
      data;
    if (a) {
      data = a[window.location.pathname.replace(/\//g, "_")] || [];
      if (data.length) data.forEach(e => $(e).click());
    }
    this.isFromUserAction = true;
  },
  objLength(obj) {
    let count = 0;
    for (let i in obj) {
      if (obj.hasOwnProperty(i)) count++;
    }
    return count;
  },
  isFirefox() {
    if (typeof InstallTrigger !== 'undefined') return true;
    else if (typeof InstallTrigger === 'undefined') return false;
  },
  string2Node(html) {
    let template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
  },
  tweakTable(e) {
    e.setAttribute('tweaked', '');
    $(e.querySelector('table')).sticky({
      top: "thead tr",
    });
    $(e).floatingScroll();
  }
};
document.addEventListener("DOMContentLoaded", async () => {

  //#region Btn bật/tắt darkmode
  $("#darkModeToggle").on('click', function () {
    let isDark = this.checked;
    if (!isDark) {
      dngndFunc.d("html").removeAttribute('night');
      localStorage.setItem('darkmode', 'disabled');
    }
    if (isDark) {
      dngndFunc.d("html").setAttribute('night', '');
      localStorage.setItem('darkmode', 'enabled');
    }
  });
  //#endregion

  //#region Tắt/bật công tắc
  // $(".toggleElemBtn>input").on("click", function () {
  //   let status = this.checked,
  //     label = this.parentNode.parentNode,
  //     hideText = label.querySelector(".hideText"),
  //     showText = label.querySelector(".showText");
  //   if (status) {
  //     hideText.classList.add("inactive");
  //     showText.classList.remove("inactive");
  //   } else if (!status) {
  //     hideText.classList.remove("inactive");
  //     showText.classList.add("inactive");
  //   }
  // });
  //#endregion

  $(".table").each((i, e) => (!e.getAttribute('tweaked')) && dngndFunc.tweakTable(e));

  // #region Khởi tạo mấy cái khung download linh tinh
  let downloadView = () => {
    let
      a = 'dl-grid-view',
      b = 'dl-direct-view',
      c = 'dl-normal-view';

    let reTweakTable = (e) => (!e.querySelector(".table").getAttribute('tweaked')) && dngndFunc.tweakTable(e);

    if ($(a).length) $(a).each((i, e) => dngndFunc.dlGridView(e.getAttribute('data'), e));
    if ($(b).length) $(b).each(async (i, e) => {
      await dngndFunc.dlTableView(e.getAttribute('data'), e, "direct");
      reTweakTable(e);
    });
    if ($(c).length) $(c).each(async (i, e) => {
      await dngndFunc.dlTableView(e.getAttribute('data'), e, "normal");
      reTweakTable(e);
    });
  };
  downloadView();
  //#endregion

  // #region plugins config
  // Add slideDown animation to Bootstrap dropdown when expanding.
  $('.dropdown').on('show.bs.dropdown', function () {
    $(this).find('.dropdown-menu').first().stop(true, true).slideDown("fast");
  });

  // Add slideUp animation to Bootstrap dropdown when collapsing.
  $('.dropdown').on('hide.bs.dropdown', function () {
    $(this).find('.dropdown-menu').first().stop(true, true).slideUp("fast");
  });

  // #endregion

  // #region Firefox Lưu lại state "check" của btn
  if (dngndFunc.isFirefox()) {
    $('.toggleElemBtn>input').each((i, e) => {
      let status = e.checked;
      if (status) {
        e.click();
        e.click();
      }
    });
  }
  //#endregion

  let singlePage = dngndFunc.d('.info-ctn') ? dngndFunc.d('.info-ctn') : void 0;
  if (singlePage) {
    singlePage.querySelector('.title').innerHTML = dngndFunc.d('movie-name').innerHTML;
    singlePage.querySelector('.release-year').innerHTML = dngndFunc.d('release-year').innerHTML;
  }

});
window.addEventListener('load', () => {
  if (!dngndFunc.isFirefox()) dngndFunc.recheckBoxes();
});

// #region WEBP Polyfill
var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) {
  return p.toString() === "[object SafariRemoteNotification]";
})(!window.safari || (typeof safari !== 'undefined' && safari.pushNotification));

if (!!document.documentMode || isSafari) {
  let webpMachine = new webpHero.WebpMachine();
  webpMachine.polyfillDocument();
}
// #endregion

// #region Get the DOM path of the clicked <a>
// Source: https://stackoverflow.com/a/28150097
$.fn.fullSelector = function () {
  let path = this.parents().addBack();
  let quickCss = path.get().map(item => {
    let self = $(item),
      id = item.id ? '#' + item.id : '',
      clss = item.classList.length ? item.classList.toString().split(' ').map(c => '.' + c).join('') : '',
      name = item.nodeName.toLowerCase(),
      index = self.siblings(name).length ? ':nth-child(' + (self.index() + 1) + ')' : '';
    if (name === 'html' || name === 'body') return name;
    return name + index + id + clss;
  }).join(' > ');
  return quickCss;
};
//#endregion