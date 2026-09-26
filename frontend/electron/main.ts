import { app, BrowserWindow, net, protocol, shell } from 'electron'
import { join, relative, resolve } from 'path'
import { pathToFileURL } from 'url'
import { registerAppIpc } from './ipc/app'

const isDev = !app.isPackaged
const rendererScheme = 'pos'
const rendererHost = 'app'

protocol.registerSchemesAsPrivileged([
  {
    scheme: rendererScheme,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      codeCache: true
    }
  }
])

function registerRendererProtocol(): void {
  const rendererRoot = resolve(__dirname, '../renderer')

  protocol.handle(rendererScheme, (request) => {
    const requestUrl = new URL(request.url)

    if (requestUrl.host !== rendererHost) {
      return new Response('Not found', { status: 404 })
    }

    let pathname: string

    try {
      pathname = decodeURIComponent(requestUrl.pathname)
    } catch {
      return new Response('Bad request', { status: 400 })
    }

    const requestedFile = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '')
    const filePath = resolve(rendererRoot, requestedFile)
    const relativePath = relative(rendererRoot, filePath)

    if (relativePath.startsWith('..') || relativePath.includes(':')) {
      return new Response('Forbidden', { status: 403 })
    }

    return net.fetch(pathToFileURL(filePath).toString())
  })
}

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    show: false,
    title: 'University HomeStay POS',
    backgroundColor: '#FBFBFA',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadURL(`${rendererScheme}://${rendererHost}/index.html`)
  }
}

app.whenReady().then(() => {
  registerRendererProtocol()
  registerAppIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
