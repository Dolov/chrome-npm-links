const input = document.getElementById('npm-name-input')
const search = document.getElementById('search-btn')
const history = document.getElementById('history')
const searchText = document.getElementById('search-text')
const listContainer = document.getElementById('list-container')

const NPM_URL = 'https://proxy.clickapaas.com/api/npm-search'
const CACHE_NAME = 'npm-links-name-histroy'
const ELEMENT_DATA_NAME = 'npm-name'
const MAX_HISTORY_LENGTH = 20
const ERROR_CLASS_NAME = 'is-error'
const SUCCESS_CLASS_NAME = 'is-success'

/** 记录是否处于请求状态 */
let loading = false

/** 进行搜索 */
const doSearch = async () => {
  if (loading) return
  const npmName = input?.value?.replace(/\s/g, '')
  if (!npmName) {
    input.setAttribute('placeholder', 'Please enter npm package name')
    return
  }

  loading = true
  searchText.classList.add('loading')
  const list = await fetch(`${NPM_URL}?name=${npmName}`)
    .then(res => res.json())
    .finally(() => {
      loading = false
      searchText.classList.remove('loading')
    })
    .catch(err => {})

  if (Array.isArray(list)) {
    renderList(list)
    handleCache(npmName, renderHistory)
    handleSuccessStyle()
    return
  }
  handleErrorStyle()
}

/** 渲染查询出的数据项 */
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
  input.classList.add(ERROR_CLASS_NAME)
  search.classList.add(ERROR_CLASS_NAME)
}

/** 查询成功的处理 */
const handleSuccessStyle = () => {
  input.classList.add(SUCCESS_CLASS_NAME)
  search.classList.add(SUCCESS_CLASS_NAME)
}

/** 缓存查询的包名 */
const handleCache = (name, callback) => {
  // 从chrome.storage获取数据
  chrome.storage.local.get([CACHE_NAME], result => {
    const data = (Array.isArray(result[CACHE_NAME]) ? result[CACHE_NAME]: [])
      .filter(item => item !== name)
    
    data.unshift(name)
    
    if (data.length > MAX_HISTORY_LENGTH) {
      data.length = MAX_HISTORY_LENGTH
    }
    // 保存数据到chrome.storage
    chrome.storage.local.set({[CACHE_NAME]: data}, () => {
      callback()
    });
  });
}

const renderHistory = () => {
  chrome.storage.local.get([CACHE_NAME], result => {
    const data = Array.isArray(result[CACHE_NAME]) ? result[CACHE_NAME]: []
    const html = data.reduce((html, item) => {
      return html += 
        `
          <span class="history-item nes-badge">
            <span class="is-gray" ${ELEMENT_DATA_NAME}=${item}>${item}</span>
          </span>
        `
    }, '')
    history.innerHTML = html
  });
}

renderHistory()

search.addEventListener('click', doSearch)
input.addEventListener('keypress', e => {
  if (e.key == 'Enter') {
    doSearch()
  }
})

history.addEventListener('click', e => {
  const name = e.target.getAttribute(ELEMENT_DATA_NAME)
  if (!name) return
  input.value = name
  doSearch()
})