FROM python:3.10-slim

WORKDIR /Docker_Controller

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

# 启动 Uvicorn 服务器
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]
