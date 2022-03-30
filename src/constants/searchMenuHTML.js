const searchMenuHTML = `
  <div class="ytp-popup ytp-search-menu ytp-panel" data-layer="7" style="z-index: 69; will-change: width,height; display: none;">
      <div class="ytp-search-left-wrapper" style="float: left; overflow: hidden; width: auto;">
        <input class="ytp-search-input" placeholder="Search..." style="background: transparent; border: none; outline: none; font-family: Roboto,Arial,Helvetica,sans-serif; color: #FFF; width: 100%;" />
      </div>
      <div class="ytp-search-right-wrapper" style="float: right;">
        <span class="ytp-search-results" style="float: left; font-family: Roboto,Arial,Helvetica,sans-serif; color: #AAA;"></span>
        <button class="ytp-search-prev-btn" style="float: left; cursor: pointer; overflow: hidden;">
          <img class="ytp-search" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMTAwJSIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgMzIgMzIiIHdpZHRoPSIxMDAlIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZmZmIiAvPjwvc3ZnPg==" style="transform: scaleX(-1)" />
        </button>
        <button class="ytp-search-next-btn" style="float: left; cursor: pointer; overflow: hidden;">
          <img class="ytp-search" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMTAwJSIgdmVyc2lvbj0iMS4xIiB2aWV3Qm94PSIwIDAgMzIgMzIiIHdpZHRoPSIxMDAlIj48cGF0aCBkPSJtIDEyLjU5LDIwLjM0IDQuNTgsLTQuNTkgLTQuNTgsLTQuNTkgMS40MSwtMS40MSA2LDYgLTYsNiB6IiBmaWxsPSIjZmZmIiAvPjwvc3ZnPg==" />
        </button>
      </div>
  </div>
  <style>
    .ytp-search-menu {
      width: 280px;
      padding: 8px 15px 8px 15px;
    }
    .ytp-search-left-wrapper input {
      font-size: 13px;
      height: 26px;
    }
    .ytp-search-results {
      font-size: 13px;
      margin-top: 6px;
      margin-left: 15px;
      margin-right: 15px;
    }
    .ytp-search-prev-btn {
      margin-top: 6px;
      margin-right: 8px;
      border: none;
      outline: none;
      background: none;
    }
    .ytp-search-next-btn {
      margin-top: 6px;
      border: none;
      outline: none;
      background: none;
    }
    .ytp-search-next-btn img,
    .ytp-search-prev-btn img {
      width: 30px;
      height: 30px;
      margin: -10px;
      clip-path: inset(9px 11px 9px 11px);
    }
    .ytp-search-menu--fs {
      width: 380px;
      height: 40px;
      padding: 10px 18px 10px 18px;
    }
    .ytp-search-left-wrapper--fs input {
      font-size: 20px;
      height: 36px;
    }
    .ytp-search-results--fs {
      font-size: 20px;
      margin-top: 6px;
      margin-left: 15px;
      margin-right: 15px;
    }
    .ytp-search-prev-btn--fs {
      margin-top: 10px;
      margin-right: 6px;
    }
    .ytp-search-next-btn--fs {
      margin-top: 10px;
    }
    .ytp-search-next-btn--fs img,
    .ytp-search-prev-btn--fs img {
      width: 40px;
      height: 40px;
      margin: -12px;
      clip-path: inset(12px 15px 12px 15px);
    }
  </style>
`;
