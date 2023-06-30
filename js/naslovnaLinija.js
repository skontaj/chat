async function NaslovnaLinija() {
  let header = document.querySelector('header');

  header.innerHTML = `
    <div class="wrapper">
      <nav>
        <input type="checkbox" id="show-search">
        <input type="checkbox" id="show-menu">
        <label for="show-menu" class="menu-icon"><i class="fas fa-bars"></i></label>
        <div class="content">
          <div class="logo"><a href="index.html">Chat</a></div>
          <ul class="links">
            <li><a href="index.html">Chat with friends</a></li>
            <li><a href="requests.html">Friends requests</a></li>
            <li>
              <form action="/logout" method="POST">
                <button type="submit" id="logout"><a>Logout</a></button>
              </form>
            </li>
          </ul>
        </div>
        <label for="show-search" class="search-icon"><i class="fas fa-search"></i></label>
        <form class="search-box">
          <input type="text" id="searchBar" name="searchBar" placeholder="Type Something to Search..." required>
          <button type="submit" id="search_btn" class="go-icon"><i class="fas fa-long-arrow-alt-right"></i></button>
        </form>
      </nav>
    </div>
  `;
}

NaslovnaLinija();
