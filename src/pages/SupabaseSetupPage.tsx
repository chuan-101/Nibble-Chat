import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getSupabaseConfigSource,
  hasSupabaseConfig,
  removeLocalSupabaseConfig,
  setLocalSupabaseConfig,
} from '../supabase/client'
import { readLocalSupabaseConfig } from '../storage/supabaseConfig'
import './SupabaseSetupPage.css'

const isValidSupabaseUrl = (value: string) => {
  const trimmed = value.trim()
  return trimmed.startsWith('https://') && trimmed.includes('.supabase.co')
}

const SupabaseSetupPage = () => {
  const navigate = useNavigate()
  const localConfig = useMemo(() => readLocalSupabaseConfig(), [])
  const [url, setUrl] = useState(localConfig?.url ?? '')
  const [anonKey, setAnonKey] = useState(localConfig?.anonKey ?? '')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const source = getSupabaseConfigSource()
  const configured = hasSupabaseConfig()

  const handleSave = () => {
    const trimmedUrl = url.trim()
    const trimmedAnonKey = anonKey.trim()
    if (!isValidSupabaseUrl(trimmedUrl)) {
      setError('请输入有效的 Supabase Project URL（需以 https:// 开头并包含 .supabase.co）。')
      setStatus(null)
      return
    }
    if (!trimmedAnonKey) {
      setError('请输入 Supabase anon public key。')
      setStatus(null)
      return
    }
    setLocalSupabaseConfig({ url: trimmedUrl, anonKey: trimmedAnonKey })
    setError(null)
    setStatus('配置已保存。')
    navigate('/auth', { replace: true })
  }

  const handleClear = () => {
    removeLocalSupabaseConfig()
    setStatus('已清除本地 Supabase 配置。')
    setError(null)
    setUrl('')
    setAnonKey('')
  }

  return (
    <div className="setup-page">
      <div className="setup-card">
        <h1 className="ui-title">Supabase 初始化</h1>
        <p className="subtitle">本项目不提供公共后端。请先创建你自己的 Supabase 项目，并在此页面填写 URL/anon key。</p>
        <p className="setup-note">该配置仅保存在本地浏览器，不会上传。更换设备需要重新填写。</p>
        {configured ? (
          <p className="setup-source">
            当前连接来源：{source === 'local' ? '本地配置' : '构建环境变量（仅开发调试建议）'}。
          </p>
        ) : null}
        <label className="field">
          <span className="field-label">Supabase Project URL</span>
          <input
            type="url"
            placeholder="https://xxxx.supabase.co"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="field-label">Supabase anon public key</span>
          <textarea
            rows={4}
            placeholder="粘贴 anon public key"
            value={anonKey}
            onChange={(event) => setAnonKey(event.target.value)}
          />
        </label>
        <div className="setup-actions">
          <button type="button" className="primary" onClick={handleSave}>
            保存配置
          </button>
          <button type="button" className="ghost" onClick={handleClear}>
            清除配置
          </button>
        </div>
        {status ? <p className="status">{status}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </div>
    </div>
  )
}

export default SupabaseSetupPage
