import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  InputGroup,
  DropdownButton,
  Dropdown,
  Form,
  Button,
  Modal,
  ToggleButtonGroup,
  ToggleButton,
  ButtonGroup,
  Table,
} from "react-bootstrap";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

function App() {
  const [valor, setValor] = useState("");
  const [moedaOrigem, setMoedaOrigem] = useState("USD");
  const [moedaDestino, setMoedaDestino] = useState("BRL");
  const [moedasDisponiveis, setMoedasDisponiveis] = useState([
    "USD",
    "BRL",
    "ARS",
  ]);
  const [resultado, setResultado] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [conversoes, setConversoes] = useState(false);
  const [gerirConversoes, setGerirConversoes] = useState(false);
  const [novaMoeda, setNovaMoeda] = useState("");
  const [novaMoedaCotacao, setNovaMoedaCotacao] = useState("");
  const [taxas, setTaxas] = useState({});
  const [editarMoeda, setEditarMoeda] = useState("");
  const [newCotacao, setNewCotacao] = useState("");
  const [carregandoInicial, setCarregandoInicial] = useState(true);

  // Função para buscar o histórico ao carregar a página
  const carregarHistorico = async () => {
    try {
      const response = await axios.get(`${API_URL}/conversoes`);
      setHistorico(response.data);
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        console.error("Erro ao buscar histórico:", error);
      }
    }
  };

  const carregarModas = async () => {
    try {
      const response = await axios.get(`${API_URL}/taxas`);
      setMoedasDisponiveis(Object.keys(response.data));
      setTaxas(response.data);
    } catch (error) {
      console.error("Erro ao buscar moedas disponíveis:", error);
    }
  };

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      setCarregandoInicial(true);
      await Promise.all([carregarHistorico(), carregarModas()]);
      setCarregandoInicial(false);
    };
    carregarDadosIniciais();
  }, []);

  // Se ainda estiver carregando os dados do banco/API, mostra apenas o loading na tela
  if (carregandoInicial) {
    return (
      <div className="container mt-5 text-center">
        <div
          className="spinner-border text-primary"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Carregando...</span>
        </div>
        <h4 className="mt-3">Conectando ao servidor e carregando dados...</h4>
      </div>
    );
  }
  // Função para lidar com o clique do botão "Converter"
  const handleConverter = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro(null);
    setResultado(null);

    try {
      const response = await axios.get(
        `${API_URL}/converter/${valor}/${moedaOrigem}/${moedaDestino}`,
      );
      setResultado(response.data);
      // Atualiza o histórico após a conversão
      carregarHistorico();
    } catch (error) {
      if (error.response) {
        setErro(error.response.data.detail);
      } else {
        setErro("Erro ao conectar com o servidor.");
      }
    } finally {
      setCarregando(false);
    }
  };

  // function para lidar com o clique do botão "Adicionar Conversão"
  const handleAdicionarCotacao = async (e) => {
    e.preventDefault();
    setCarregando(true);
    setErro(null);

    try {
      const response = await axios.post(
        `${API_URL}/taxas/${novaMoeda}/${novaMoedaCotacao}`,
      );
      setResultado(response.data);
      setMoedasDisponiveis([...moedasDisponiveis, novaMoeda]);
      setNovaMoeda("");
      setNovaMoedaCotacao("");
      setConversoes(false);
    } catch (error) {
      if (error.response) {
        setErro(error.response.data.detail);
      } else {
        setErro("Erro ao conectar com o servidor.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Conversor de Moedas</h1>
      {/* Aqui você vai inserir o seu formulário usando Bootstrap */}
      {/* Utilize os estados: valor, moedaOrigem, moedaDestino */}
      {/* Lembre-se de vincular o botão "Converter" à função handleConverter */}
      <Form onSubmit={handleConverter}>
        <div className="row justify-content-center">
          <div className="col-md-5">
            <Form.Label>Valor e Moeda de Origem</Form.Label>
            <InputGroup className="mb-3">
              {/* Campo de digitar o valor numérico */}
              <Form.Control
                type="number"
                placeholder="0.00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                aria-label="Valor para converter"
                required
              />
              {/* Dropdown com a moeda escolhida no título */}
              <DropdownButton
                variant="outline-primary"
                title={moedaOrigem}
                id="dropdown-origem"
                align="end"
              >
                {moedasDisponiveis.map((moeda) => (
                  <Dropdown.Item
                    key={moeda}
                    onClick={() => setMoedaOrigem(moeda)}
                  >
                    {moeda}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
            </InputGroup>
          </div>

          <div className="col-md-5">
            <Form.Label>Moeda de Destino</Form.Label>
            <InputGroup className="mb-3">
              <Form.Control
                disabled
                placeholder="Resultado"
                aria-label="Campo de destino"
                value={resultado ? resultado.convertido : ""}
              />
              <DropdownButton
                variant="outline-success"
                title={moedaDestino}
                id="dropdown-destino"
                align="end"
              >
                {moedasDisponiveis.map((moeda) => (
                  <Dropdown.Item
                    key={moeda}
                    onClick={() => setMoedaDestino(moeda)}
                  >
                    {moeda}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
            </InputGroup>
          </div>
        </div>

        <div className="text-center mt-3 mb-4">
          <Button variant="primary" type="submit" size="lg">
            Converter Moedas
          </Button>
        </div>
      </Form>
      <div className="text-center mt-3 mb-4">
        <ButtonGroup>
          <Button variant="light" onClick={() => setConversoes(true)}>
            Adicionar Cambio
          </Button>
          <Button variant="light" onClick={() => setGerirConversoes(true)}>
            Editar Cambios
          </Button>
        </ButtonGroup>
      </div>

      <Modal
        show={conversoes}
        onHide={() => {
          setConversoes(false);
          setErro(null);
        }}
      >
        <Modal.Header closeButton={!carregando}>
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAdicionarCotacao}>
            <Form.Group className="mb-3">
              <Form.Label>Moeda</Form.Label>
              <Form.Control
                type="text"
                placeholder="EUR"
                value={novaMoeda}
                onChange={(e) => setNovaMoeda(e.target.value)}
                required
                disabled={carregando}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Cotação</Form.Label>
              <Form.Control
                type="number"
                placeholder="0.00"
                value={novaMoedaCotacao}
                onChange={(e) => setNovaMoedaCotacao(e.target.value)}
                required
                disabled={carregando}
              />
              <Form.Text muted>
                {" "}
                Insira a cotação da moeda em relação ao USD.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        {carregando && (
          <div className="text-center">
            <div className="spinner-border text-primary" role="status"></div>
            <p>Carregando...</p>
          </div>
        )}
        {erro && <div className="alert alert-danger">{erro}</div>}
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setConversoes(false);
              setErro(null);
            }}
          >
            Fechar
          </Button>
          <Button
            variant="primary"
            onClick={handleAdicionarCotacao}
            disabled={carregando}
          >
            Salvar Cotação
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={gerirConversoes}
        onHide={() => {
          setGerirConversoes(false);
          setErro(null);
          setEditarMoeda("");
        }}
      >
        {/* se carregando for true desabilitar o close button */}
        <Modal.Header closeButton={!carregando}>
          <Modal.Title>Editar Conversões</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {carregando && (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status"></div>
              <p>Carregando...</p>
            </div>
          )}
          {erro && <div className="alert alert-danger">{erro}</div>}
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Moeda</th>
                <th>Cotação (Para o USD)</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {moedasDisponiveis.map((moeda) => (
                <tr key={moeda}>
                  <td>{moeda}</td>
                  <td>
                    {editarMoeda != taxas[moeda] && taxas[moeda]}
                    {editarMoeda == taxas[moeda] && (
                      <Form.Group className="mb-3">
                        <Form.Control
                          type="number"
                          value={newCotacao}
                          onChange={(e) => {
                            setNewCotacao(e.target.value);
                          }}
                          required
                        />
                      </Form.Group>
                    )}
                  </td>
                  <td>
                    <ButtonGroup>
                      {editarMoeda != taxas[moeda] && (
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => {
                            setEditarMoeda(taxas[moeda]);
                            setNewCotacao(taxas[moeda]);
                          }}
                          disabled={carregando}
                        >
                          Editar
                        </Button>
                      )}
                      {editarMoeda == taxas[moeda] && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => {
                            // Salvar a edição da cotação
                            axios
                              .post(`${API_URL}/taxas/${moeda}/${newCotacao}`)
                              .then(() => {
                                setEditarMoeda("");
                                carregarModas();
                                setErro(null);
                              })
                              .catch((error) => {
                                console.error("Erro ao editar moeda:", error);
                                setErro(
                                  "Erro ao editar moeda. Tente novamente.",
                                );
                              });
                          }}
                          disabled={carregando}
                        >
                          Salvar
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          // ativar um alert antes de liberar
                          if (
                            window.confirm(
                              `Tem certeza que deseja remover a moeda ${moeda}?`,
                            )
                          ) {
                            axios
                              .delete(`${API_URL}/taxas/${moeda}`)
                              .then(() => {
                                carregarModas();
                              })
                              .catch((error) => {
                                console.error("Erro ao remover moeda:", error);
                                setErro(
                                  "Erro ao remover moeda. Tente novamente.",
                                );
                              });
                          }
                        }}
                        disabled={carregando}
                      >
                        Remover
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>

      {/* Exibição do estado de "carregando" exigido pelo desafio */}
      {carregando && !conversoes && !gerirConversoes && (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p>Carregando...</p>
        </div>
      )}

      {/* Exibição de Erros */}
      {erro && !conversoes && !gerirConversoes && (
        <div className="alert alert-danger">{erro}</div>
      )}

      {/* Exibição do Resultado */}
      {resultado?.valor && (
        <div className="alert alert-success text-center">
          Convertido: {resultado.valor} {resultado.moeda_origem} ➔{" "}
          {resultado.convertido} {resultado.moeda_destino}
        </div>
      )}
      {resultado?.message && (
        <div className="alert alert-info text-center">{resultado.message}</div>
      )}
      <hr />

      {/* Componente para exibir o Histórico das últimas 5 conversões */}
      <h2>Histórico Recente</h2>
      <ul className="list-group">
        {historico.map((item, index) => (
          <li key={index} className="list-group-item">
            {item.valor} {item.moeda_origem} ➔ {item.convertido}{" "}
            {item.moeda_destino}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
