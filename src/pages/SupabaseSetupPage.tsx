import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getSupabaseConfigSource,
  hasSupabaseConfig,
  removeLocalSupabaseConfig,
  setLocalSupabaseConfig,
} from '../supabase/client'
import { readLocalSupabaseConfig } from '../storage/supabaseConfig'
import { getSupabaseProjectInputDisplay, normalizeSupabaseProjectInput } from '../utils/supabaseProjectInput'
import './SupabaseSetupPage.css'

const SupabaseSetupPage = () => {
  const navigate = useNavigate()
  const localConfig = useMemo(() => readLocalSupabaseConfig(), [])
  const [projectInput, setProjectInput] = useState(localConfig ? getSupabaseProjectInputDisplay(localConfig.url) : '')
  const [anonKey, setAnonKey] = useState(localConfig?.anonKey ?? '')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  const source = getSupabaseConfigSource()
  const configured = hasSupabaseConfig()

  const handleSave = () => {
    const normalizedProject = normalizeSupabaseProjectInput(projectInput)
    const trimmedAnonKey = anonKey.trim()
    if ('error' in normalizedProject) {
      setError(normalizedProject.error)
      setStatus(null)
      return
    }
    if (!trimmedAnonKey) {
      setError('请输入 Supabase anon public key。')
      setStatus(null)
      return
    }
    setLocalSupabaseConfig({ url: normalizedProject.url, anonKey: trimmedAnonKey })
    setError(null)
    setStatus('配置已保存。')
    navigate('/auth', { replace: true })
  }

  const handleClear = () => {
    removeLocalSupabaseConfig()
    setStatus('已清除本地 Supabase 配置。')
    setError(null)
    setProjectInput('')
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
          <span className="field-label">Supabase Project ID (ref)</span>
          <span className="setup-note">只需填写 Project ID（ref）。系统会自动生成 https://&#123;ref&#125;.supabase.co</span>
          <input
            type="text"
            placeholder="gugyzgigttcyytrgxeqi"
            value={projectInput}
            onChange={(event) => setProjectInput(event.target.value)}
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
