export type Challenge = {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  created_by: string
  is_public: boolean
}

export type DailyLog = {
  id: string
  user_id: string
  challenge_id: string
  log_date: string
  sins_of_omission: string | null
  sins_of_commission: string | null
  is_completed: boolean
}