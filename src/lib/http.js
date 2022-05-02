import axios from 'axios'
import axiosDebug from 'axios-debug-log'

export const http = axios.create()
axiosDebug.addLogger(axios)
