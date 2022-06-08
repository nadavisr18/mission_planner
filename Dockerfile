FROM python:3.7-slim
WORKDIR .
COPY . ./
RUN pip install -r requirements.txt
CMD [ "python", "app.py"]