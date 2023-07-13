const input = document.getElementById('npm-name-input')
const search = document.getElementById('search-btn')
const listContainer = document.getElementById('list-container')


/** 进行搜索 */
const doSearch = async () => {
  const npmName = input.value
  if (!npmName) {
    input.setAttribute('placeholder', '请输入依赖包名称')
    return
  }
  const list = await fetch(`https://proxy.clickapaas.com/api/npm-search?name=${npmName}`)
    .then(res => res.json())
    .catch(err => {})

  if (Array.isArray(list)) {
    renderList(list)
    handleSuccessStyle()
    return
  }
  handleErrorStyle()
}

const renderList = list => {
  const getItemHtml = item => {
    const {
      name,
      date,
      description,
      links,
      maintainers
    } = item

    const { npm, homepage, repository, bugs } = links || {}
    const github1s = repository ? repository.replace('://github', '://github1s'): null
    const stackoverflow = `https://stackoverflow.com/search?q=${name}`
    return `
      <div class="npm-item nes-container is-dark with-title is-rounded">
        <p class="title">${name}</p>
        <p>${description}</p>

        <a href="${npm}" class="nes-badge ${npm ? "": "none"}">
          <span class="is-primary">npm</span>
        </a>

        <a href="${repository}" class="nes-badge ${repository ? "": "none"}">
          <span class="is-success">github</span>
        </a>
 
        <a href="${github1s}" class="nes-badge ${github1s ? "": "none"}">
          <span class="is-warning">github1s</span>
        </a>

        <a href="${homepage}" class="nes-badge ${homepage ? "": "none"}">
          <span class="is-error">homepage</span>
        </a>

        <a href="${bugs}" class="nes-badge ${bugs ? "": "none"}">
          <span class="is-purple">issues</span>
        </a>

        <a href="${stackoverflow}" class="nes-badge">
          <span class="is-cyan">stackoverflow</span>
        </a>
      </div>
    `
  }
  const html = list.reduce((html, item) => {
    return html += getItemHtml(item)
  }, '')
  listContainer.innerHTML = html
}

/** 查询失败的处理 */
const handleErrorStyle = () => {
  input.classList.add('is-error')
  search.classList.add('is-error')
}

/** 查询成功的处理 */
const handleSuccessStyle = () => {
  input.classList.add('is-success')
  search.classList.add('is-success')
}

search.addEventListener('click', doSearch)
input.addEventListener('keypress', e => {
  if (e.key == 'Enter') {
    doSearch()
  }
})