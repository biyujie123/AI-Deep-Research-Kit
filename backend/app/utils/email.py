import smtplib
import random
from email.mime.text import MIMEText
import os

def generate_otp():
    """生成6位数字验证码"""
    return str(random.randint(100000, 999999))

def send_otp_email(to_email: str, otp: str) -> bool:
    """发送验证码邮件，返回是否发送成功"""
    subject = "AI 时间助手 - 登录验证码"
    body = f"""
    欢迎使用 AI 时间助手！

    你的登录验证码是：**{otp}**

    验证码有效期为 5 分钟，请尽快使用。
    如果不是本人操作，请忽略此邮件。
    """

    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = os.getenv("MAIL_USERNAME")
    msg["To"] = to_email

    try:
        server = smtplib.SMTP(os.getenv("MAIL_HOST"), int(os.getenv("MAIL_PORT")))
        server.starttls()
        server.login(os.getenv("MAIL_USERNAME"), os.getenv("MAIL_PASSWORD"))
        server.sendmail(os.getenv("MAIL_USERNAME"), [to_email], msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"❌ 发送邮件失败：{e}")
        return False