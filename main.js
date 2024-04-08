let pesquisa = document.querySelector("button")



function pesquisar() {
    let consulta = document.querySelector("input").value
    parcelamentos(formatarCPF(consulta));
}


function getAccessToken(forceRenew = false) {
  const loginUrl = 'https://realm.mongodb.com/api/client/v2.0/app/data-jqjrc/auth/providers/local-userpass/login';
  const credentials = {
      username: "weriquetiao@gmail.com",
      password: "admin123"
  };

  // Verifica se já temos um token armazenado e não estamos forçando a renovação
  if (!forceRenew && localStorage.getItem('accessToken')) {
      return Promise.resolve(localStorage.getItem('accessToken'));
  }

  // Obtem um novo token
  return fetch(loginUrl, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
  })
  .then(response => response.json())
  .then(data => {
      // Armazena o novo token
      localStorage.setItem('accessToken', data.access_token);
      return data.access_token;
  })
  .catch(error => {
      console.error('Falha ao obter o token de acesso', error);
      throw error;  // Re-throw the error to be handled by the caller
  });
}

function find(consulta) {
  const findOneUrl = 'https://sa-east-1.aws.data.mongodb-api.com/app/data-jqjrc/endpoint/data/v1/action/find';
  const requestData = {
      "collection": "colecao-parcelamentos",
      "database": "base-parcelamentos",
      "dataSource": "password",
      "filter": {
          'CPF': consulta
      }
  };

  function attemptFind(accessToken) {
      return fetch(findOneUrl, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(requestData)
      });
  }

  function handleResponse(response) {
      if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
              // Token might be invalid or expired, try refreshing it
              return getAccessToken(true).then(attemptFind);
          } else {
              // Some other error, rethrow it to be handled by the final catch
              throw new Error(`HTTP error! status: ${response.status}`);
          }
      } else {
          return response.json();
      }
  }

  getAccessToken()
      .then(attemptFind)
      .then(handleResponse)
      .then(data => {
          createTableFromJson(data.documents)
          if(data.documents.length == 0){
            document.querySelector("#par").style.display = 'none'
          } else{
            document.querySelector("#par").style.display = 'block'
          }
      })
      .catch(error => {
          console.error('Failed to find', error);
      });
}




async function parcelamentos(cpf) {

    try {
        const consutar = await find(cpf);
        const saida = consultar['documents']
        if(saida.length > 0){
            for (let i = 0; i < saida.length; i++) {
                const lista = saida[i];
        
                if ((lista["SITUACAO"] === "DEFERIDO E CONSOLIDADO" || lista["SITUACAO"] === "AGUARDANDO DEFERIMENTO") && lista["NUMERO PARCELAS"] > 12) {
        
                    let prima;
                    let primo;
                    let cnpj = lista['CPF']
                    let data_parcelamento = lista['MES']
                    let modalidade = lista['TIPO']
                    let nome_empresa = lista['NOME']
                    let qnt_parcelas = lista['NUMERO PARCELAS']
                    let valor_consolidado =  parseFloat(lista['VALOR PARCELAD'].replace('.', '').replace(',','.'));
                    let valor_principal = parseFloat(lista['VALOR PRINCIPAL'].replace('.', '').replace(',','.'));
                    let valor_parcelas;
                    let qnt_parcelas_reducao;
                    if (lista['TIPO'].indexOf("TRANSACAO EXCEPCIONAL") !== -1){
                        if(lista['TIPO'].indexOf("DEBITOS PREVIDENCIARIOS") !== -1) {
                            valor_parcelas = (valor_consolidado - (valor_consolidado*0.04))/48
                            prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.04))/48')
                        } else {
                            valor_parcelas = (valor_consolidado - (valor_consolidado*0.04))/(qnt_parcelas-12)
                            prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.04))/(qnt_parcelas-12)')
                        }
                        
                    } else if (lista["MODALIDADE"].indexOf("TRANSACAO EXTRAORDINARIA") !== -1){
                        if (lista['TIPO'].indexOf("PREVIDENCIARIO") !== -1) {
                            valor_parcelas = (valor_consolidado - (valor_consolidado*0.01))/48
                            prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.01))/48')
                        } else {
                            valor_parcelas = (valor_consolidado - (valor_consolidado*0.01))/(qnt_parcelas-12)
                            prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.01))/(qnt_parcelas-12)')
                        }
                    } else if (lista['TIPO'].indexOf("EDITAL") !== -1){
                        if (lista['TIPO'].indexOf("PREVIDENCIARIO") !== -1) {
                            if (lista["MODALIDADE"].indexOf("PEQUENO PORTE") !== -1) {
                                valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/48
                                prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/48')
                            } else {
                                valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/54
                                prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/54')
                            }
                        } else {
                            if (lista["MODALIDADE"].indexOf("PEQUENO PORTE") !== -1) {
                                valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/(qnt_parcelas-12)
                                prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/(qnt_parcelas-12)')
                            } else {
                                valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/(qnt_parcelas-6)
                                prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/(qnt_parcelas-6)')
                            }
                        }
                    } else if (lista['TIPO'].indexOf("CONVENCIONAL") !== -1 || lista['TIPO'].indexOf("PARCELAMENTO DA RECUPERACAO JUDICIAL") !== -1){
                        if (lista['TIPO'].indexOf("NAO PREVIDENCIARIA") !== -1) {
                            valor_parcelas = valor_consolidado/qnt_parcelas
                            prima = console.log('valor_parcelas = valor_principal/qnt_parcelas')
                        } else {
                            valor_parcelas = valor_consolidado/60
                            prima = console.log('valor_parcelas = valor_principal/60')
                        }
                    } else if (lista['TIPO'].indexOf("PERT") !== -1) {
                        if (lista['TIPO'].indexOf("DEBITOS PREVIDENCIARIOS") !== -1) {
                            valor_parcelas = (valor_consolidado - (valor_consolidado*0.15))/60
                            prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.15))/60')
                        } else {
                            valor_parcelas = (valor_consolidado - (valor_consolidado*0.15))/qnt_parcelas
                            prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.15))/qnt_parcelas')
                        }
                    }
        
        
        
                    if (lista["TIPO"].indexOf("PREVIDENCIARIO") !== -1 || lista["MODALIDADE"].indexOf("PREVIDENCIARIO") !== -1) {
                        qnt_parcelas_reducao = 60
                    } else {
                        qnt_parcelas_reducao = 145
                    }
        
                    inserirTabelas(cpf, data_parcelamento, modalidade, nome_empresa, qnt_parcelas, valor_consolidado, valor_principal, valor_parcelas, qnt_parcelas_reducao)
                    
                    
                }
            
                
                
            }
        }else{
            alert("CPF NÃO ENCONTRADO")
        }
    } catch (erro) {
        console.error('Erro ao filtrar por CPF:', erro);
        throw erro; // Rejogue o erro para que seja capturado externamente, se necessário
    }
    
}





function inserirTabelas(cnpj, data, modalidade, nome_empresa, qnt_parcelas, valor_consolidado, valor_principal, valor_parcelas, qnt_parcelas_reducao) {
    let reducao = (valor_consolidado-valor_principal)*0.92
    let principal_assessoria = valor_consolidado-reducao
    let entrada = (principal_assessoria*0.06)
    let primeiro_ano =  entrada/12
    let parcelas_restantes = (principal_assessoria-entrada)/(qnt_parcelas_reducao-12)
    let fluxo_mensal = valor_parcelas - primeiro_ano
    let fluxo_anual = fluxo_mensal*12
    let html = `
    <table class="sem-villela" cellspacing="0" cellpadding="5">
        <thead>
            <tr>
                <th class="nome-empresa">${nome_empresa}</th>
                <th class="end cnpj">${cnpj}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="tipo-parcelamento" colspan="2">${modalidade}</td>
            </tr>
            <tr class="data-parcelamento">
                <td class="start">DATA PARCELAMENTO</td>
                <td class="end">${data}</td>
            </tr>
            <tr class="valor-consolidado">
                <td class="start">VALOR CONSOLIDADO</td>
                <td class="end">R$ ${formatarNumero(valor_consolidado)}</td>
            </tr>
            <tr class="valor-principal">
                <td class="start">VALOR PRINCIPAL</td>
                <td class="end">R$ ${formatarNumero(valor_principal)}</td>
            </tr>
            <tr class="num-parcelas">
                <td class="start">Nº PARCELAS TOTAL</td>
                <td class="end">${qnt_parcelas}</td>
            </tr>
            <tr class="valor-parcela">
                <td class="start">VALOR PARCELA APROX. APÓS O PEDÁGIO</td>
                <td class="end">R$ ${formatarNumero(valor_parcelas)}</td>
            </tr>
        </tbody>
    </table>

    <table class="com-villela" cellspacing="0" cellpadding="5">
        <thead>
            <tr>
                <th colspan="2">CONDIÇÕES APÓS ASSESSORIA DA VILLELA BRASIL BANK</th>
            </tr>
        </thead>
        <tbody>
            <tr class="valor-reducao">
                <td class="start">REDUÇÃO DE ATÉ</td>
                <td class="end">R$ ${formatarNumero(reducao)}</td>
            </tr>
            <tr class="valor-consolidado-villela">
                <td class="start">VALOR APOX. APÓS ASSESSORIA</td>
                <td class="end">R$ ${formatarNumero(principal_assessoria)}</td>
            </tr>
            <tr class="valor-parcela-villela">
                <td class="start">Nº PARCELAS ATÉ</td>
                <td class="end">${qnt_parcelas_reducao}</td>
            </tr>
            <tr class="primeiro-ano-villela">
                <td class="start">1ª a 12ª</td>
                <td class="end">R$ ${formatarNumero(primeiro_ano)}</td>
            </tr>
            <tr class="parcelas-restantes-villela">
                <td class="start">13ª a ${qnt_parcelas_reducao}ª</td>
                <td class="end">R$ ${formatarNumero(parcelas_restantes)}</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <th>ECONOMIA MENSAL</th>
                <th>R$ ${formatarNumero(fluxo_mensal)}</td>
            </tr>
            <tr>
                <th>ECONOMIA NO 1º ANO</th>
                <th>R$ ${formatarNumero(fluxo_anual)}</td>
            </tr>
        </tfoot>
    </table>
    <img src="fundo.png" alt="">
    `
    document.body.querySelector('#parcelamentos').innerHTML += html
    
}


function formatarNumero(numero) {
    // Converte o número para string e arredonda para duas casas decimais
    const numeroFormatado = parseFloat(numero).toFixed(2);
  
    // Divide em parte inteira e decimal
    const partes = numeroFormatado.split('.');
    const parteInteira = partes[0];
    const parteDecimal = partes[1];
  
    // Formata a parte inteira adicionando um ponto a cada três dígitos da direita para a esquerda
    const parteInteiraFormatada = parteInteira.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
    // Retorna a parte inteira e decimal formatadas
    return parteInteiraFormatada + ',' + parteDecimal;
}

function formatarCNPJ(cnpj) {
    // Remove caracteres não numéricos
    const numerosCNPJ = cnpj.replace(/\D/g, '');
  
    // Formata o CNPJ com máscara
    return numerosCNPJ.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
}



function formatarCPF(cpf) {
    // Remove caracteres não numéricos do CPF
    let cpfLimpo;
    if(cpf.slice(0,3) === "XXX"){
        return cpf
    } else{
        // Adiciona os Xs à frente do CPF
        cpfLimpo = cpf.replace(/\D/g, '')
        const cpfFormatado = 'XXX.' + cpfLimpo.slice(3, 6)+'.'+cpfLimpo.slice(6, 9) + '-XX';
        console.log(cpfFormatado)
        return cpfFormatado;
    }
 

}




function minhaFuncaoDeRedimensionamento() {
    let valor = document.querySelector("#parcelamentos > table.sem-villela > thead > tr > th.nome-empresa").getBoundingClientRect().width

    document.querySelectorAll(".com-villela  td.start").forEach(function(celula) {
        celula.style.width = `${valor}px`; // Altere para o valor de largura desejado
    });
    
}

function minhaFuncaoDeObservacao(mutationsList, observer) {
    function procurarTag() {
        // Selecione a tag que você está procurando
        var minhaTag = document.querySelector("#parcelamentos > table.sem-villela > thead > tr > th.nome-empresa");
        // Verifique se a tag existe
        if (minhaTag) {
          console.log('A tag foi encontrada:', minhaTag);
          clearInterval(intervalId); // Pare o intervalo após encontrar a tag
          minhaFuncaoDeRedimensionamento()
        } else {
          console.log('A tag não foi encontrada ainda...');
        }
    }
      
    var intervalId = setInterval(procurarTag, 1000);
}

var alvo = document.querySelector('body');

var observer = new MutationObserver(minhaFuncaoDeObservacao);

var configuracaoObservador = { childList: true, subtree: true };

observer.observe(alvo, configuracaoObservador);

// Inicia a observação do nó-alvo com as opções


// Adicione um ouvinte de evento para o evento "resize" na janela (window)
window.addEventListener("resize", minhaFuncaoDeRedimensionamento);

// Certifique-se de que a função seja executada quando a página for carregada
// para lidar com a primeira renderização

  
  
  
