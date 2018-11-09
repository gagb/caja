FROM ubuntu:16.04 

# Setup ODBC
RUN apt-get update
RUN apt-get -y install curl
RUN apt-get -y install apt-transport-https
RUN curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -
RUN curl https://packages.microsoft.com/config/ubuntu/16.04/prod.list > /etc/apt/sources.list.d/mssql-release.list
RUN apt-get update
RUN ACCEPT_EULA=Y apt-get -y install msodbcsql17
RUN ACCEPT_EULA=Y apt-get -y install mssql-tools
RUN echo 'export PATH="$PATH:/opt/mssql-tools/bin"' >> ~/.bashrc

# Install miniconda to /miniconda
RUN apt-get -y install bzip2
RUN apt-get -y install python-openpyxl
RUN curl -LO http://repo.continuum.io/miniconda/Miniconda-latest-Linux-x86_64.sh
RUN bash Miniconda-latest-Linux-x86_64.sh -p /miniconda -b
RUN rm Miniconda-latest-Linux-x86_64.sh
ENV PATH=/miniconda/bin:${PATH}
RUN conda update -y conda
RUN conda install pyodbc
RUN conda install flask
RUN pip install flask_cors
RUN pip install boto3
RUN pip install xmltodict
RUN conda install pandas
RUN pip install openpyxl
RUN pip install xlrd 
RUN conda install tqdm
