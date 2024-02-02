let pesquisa = document.querySelector("button")

async function obterToken(){
    // Verificar se já existe um token no localStorage
    const tokenSalvo = localStorage.getItem('token');
    if (tokenSalvo) {
        return tokenSalvo;
    }

    const response = await fetch('https://back-villela2.aceleradorvillela.com/api/acesso', {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json',
            'Origin': 'https://portal-saas.aceleradorvillela.com',
            'Pragma': 'no-cache',
            'Referer': 'https://portal-saas.aceleradorvillela.com/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"'        
        },
        body: JSON.stringify({
          'email': 'bianca.silva@villelabrasil.com.br',
          'senha': 'villela2022'
        })
    });

    const data = await response.json();
    const token = data['token'];

    // Salvar o token no localStorage
    localStorage.setItem('token', token);

    return token;
}

function pesquisar() {
    let consulta = document.querySelector("input").value
    consultar(removerPontuacaoCNPJ(consulta));
}


async function consultar(cnpj) {
    try{
        let token = await obterToken();


        const response = await fetch(`https://back-ecac2.aceleradorvillela.com/api/lead/buscar?cnpj=${cnpj}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6',
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Origin': 'https://portal.aceleradorvillela.com',
                'Pragma': 'no-cache',
                'Referer': 'https://portal.aceleradorvillela.com/',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-site',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
            }
        });

        const data = await response.json();


        return parcelamentos(data["id"], token);

    } catch (error) {
        localStorage.removeItem('token');
        let novoToken = await obterToken();
            
        // Refaz a consulta com o novo token
        const novaResposta = await fetch(`https://back-ecac2.aceleradorvillela.com/api/lead/buscar?cnpj=${cnpj}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6',
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Origin': 'https://portal.aceleradorvillela.com',
                'Pragma': 'no-cache',
                'Referer': 'https://portal.aceleradorvillela.com/',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-site',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
            }
        });

        // Obtém os dados da nova resposta
        const novosDados = await novaResposta.json();

        // Retorna os dados da nova consulta
        return parcelamentos(novosDados["id"], novoToken)
    }
    
}

async function parcelamentos(id, token) {
    try {
        const response = await fetch(`https://back-ecac2.aceleradorvillela.com/api/leaddetalhes/${id}/parcelados`, {
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6',
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Origin': 'https://portal.aceleradorvillela.com',
                'Pragma': 'no-cache',
                'Referer': 'https://portal.aceleradorvillela.com/',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-site',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"'
            }
        });

        const data = await response.json();
        for (let i = 0; i < data.length; i++) {
            const lista = data[i];

            if ((lista["situacao"] === "DEFERIDO E CONSOLIDADO" || lista["situacao"] === "AGUARDANDO DEFERIMENTO") && lista["qtdeDeParcelasConcedidas"] > 12) {

                let prima;
                let primo;
                let cnpj = lista['cpfCnpjDoOptante']
                let data_parcelamento = lista['mesAnoRequerimento']
                let modalidade = lista['tipoDeParcelamento']
                let nome_empresa = lista['nomeDoOptante']
                let qnt_parcelas = lista['qtdeDeParcelasConcedidas']
                let valor_consolidado = lista['valorConsolidado']
                let valor_principal = lista['valorDoPrincipal']
                let valor_parcelas;
                let qnt_parcelas_reducao;
                if (lista['tipoDeParcelamento'].indexOf("TRANSACAO EXCEPCIONAL") !== -1){
                    if(lista['tipoDeParcelamento'].indexOf("DEBITOS PREVIDENCIARIOS") !== -1) {
                        valor_parcelas = (valor_consolidado - (valor_consolidado*0.04))/48
                        prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.04))/48')
                    } else {
                        valor_parcelas = (valor_consolidado - (valor_consolidado*0.04))/(qnt_parcelas-12)
                        prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.04))/(qnt_parcelas-12)')
                    }
                    
                } else if (lista['modalidade'].indexOf("TRANSACAO EXTRAORDINARIA") !== -1){
                    if (lista['tipoDeParcelamento'].indexOf("PREVIDENCIARIO") !== -1) {
                        valor_parcelas = (valor_consolidado - (valor_consolidado*0.01))/48
                        prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.01))/48')
                    } else {
                        valor_parcelas = (valor_consolidado - (valor_consolidado*0.01))/(qnt_parcelas-12)
                        prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.01))/(qnt_parcelas-12)')
                    }
                } else if (lista['tipoDeParcelamento'].indexOf("EDITAL") !== -1){
                    if (lista['tipoDeParcelamento'].indexOf("PREVIDENCIARIO") !== -1) {
                        if (lista['modalidade'].indexOf("PEQUENO PORTE") !== -1) {
                            valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/48
                            prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/48')
                        } else {
                            valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/54
                            prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/54')
                        }
                    } else {
                        if (lista['modalidade'].indexOf("PEQUENO PORTE") !== -1) {
                            valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/(qnt_parcelas-12)
                            prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/(qnt_parcelas-12)')
                        } else {
                            valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/(qnt_parcelas-6)
                            prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.06))/(qnt_parcelas-6)')
                        }
                    }
                } else if (lista['tipoDeParcelamento'].indexOf("CONVENCIONAL") !== -1 || lista['tipoDeParcelamento'].indexOf("PARCELAMENTO DA RECUPERACAO JUDICIAL") !== -1){
                    if (lista['tipoDeParcelamento'].indexOf("NAO PREVIDENCIARIA") !== -1) {
                        valor_parcelas = valor_consolidado/qnt_parcelas
                        prima = console.log('valor_parcelas = valor_principal/qnt_parcelas')
                    } else {
                        valor_parcelas = valor_consolidado/60
                        prima = console.log('valor_parcelas = valor_principal/60')
                    }
                } else if (lista['tipoDeParcelamento'].indexOf("PERT") !== -1) {
                    if (lista['tipoDeParcelamento'].indexOf("DEBITOS PREVIDENCIARIOS") !== -1) {
                        valor_parcelas = (valor_consolidado - (valor_consolidado*0.15))/60
                        prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.15))/60')
                    } else {
                        valor_parcelas = (valor_consolidado - (valor_consolidado*0.15))/qnt_parcelas
                        prima = console.log('valor_parcelas = (valor_consolidado - (valor_consolidado*0.15))/qnt_parcelas')
                    }
                }



                if (lista["tipoDeParcelamento"].indexOf("PREVIDENCIARIO") !== -1 || lista["modalidade"].indexOf("PREVIDENCIARIO") !== -1) {
                    qnt_parcelas_reducao = 60
                } else {
                    qnt_parcelas_reducao = 145
                }
    
                inserirTabelas(cnpj, data_parcelamento, modalidade, nome_empresa, qnt_parcelas, valor_consolidado, valor_principal, valor_parcelas, qnt_parcelas_reducao)
                
                
            }
        
            
            
        }
        
    } catch (error) {
        console.error('Erro ao buscar os dados:', error);
    }
    
}

//parcelamentos();



function inserirTabelas(cnpj, data, modalidade, nome_empresa, qnt_parcelas, valor_consolidado, valor_principal, valor_parcelas, qnt_parcelas_reducao) {
    let reducao = (valor_consolidado-valor_principal)*0.85
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
                <th class="end cnpj">${formatarCNPJ(cnpj)}</th>
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

function removerPontuacaoCNPJ(cnpj) {
    // Remove caracteres não numéricos
    return cnpj.replace(/\D/g, '');
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
      
    var intervalId = setInterval(procurarTag, 100);
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

  
  
  
