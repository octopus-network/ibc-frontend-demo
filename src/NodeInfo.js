import React, { useEffect, useState } from 'react'
import { Card, Icon, Grid, Statistic } from 'semantic-ui-react'

function Main(props) {
  const { api, socket }  = props
  const [nodeInfo, setNodeInfo] = useState({})

  useEffect(() => {
    const getInfo = async () => {
      try {
        const [chain, nodeName, nodeVersion] = await Promise.all([
          api.rpc.system.chain(),
          api.rpc.system.name(),
          api.rpc.system.version(),
        ])
        setNodeInfo({ chain, nodeName, nodeVersion })
      } catch (e) {
        console.error(e)
      }
    }
    getInfo()
  }, [api.rpc.system, props.api, props.socket])

  const [blockNumber, setBlockNumber] = useState(0)
  const bestNumber = api.derive.chain.bestNumber
  const [blockNumberTimer, setBlockNumberTimer] = useState(0)

  useEffect(() => {
    const unsub = bestNumber(number => {
      setBlockNumber(number.toNumber().toLocaleString('en-US'))
    }).catch(console.error)

    return function cleanup() {
      unsub.then( result => {
        result();
      }, function(error) {
        console.error(error);
      })
    }
  }, [bestNumber])

  const timer = () => {
    setBlockNumberTimer(time => time + 1)
  }

  useEffect(() => {
    const id = setInterval(timer, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <Grid.Column>
      <Card>
        <Card.Content>
          <Card.Meta>
            <span>{nodeInfo.chain}</span>
          </Card.Meta>
          <Card.Description>{socket}</Card.Description>
        </Card.Content>
        <Card.Content extra>
          <Icon name="setting" />v{nodeInfo.nodeVersion}
        </Card.Content>
        <Card.Content textAlign="center">
          <Statistic
              className="block_number"
              label={'Current' + ' Block'}
              value={blockNumber}
          />
        </Card.Content>
        <Card.Content extra>
          <Icon name="time" /> {blockNumberTimer}
        </Card.Content>
      </Card>
    </Grid.Column>
  )
}

export default function NodeInfo(props) {
  const api = props.api
  return api &&
    api.rpc &&
    api.rpc.system &&
    api.rpc.system.chain &&
    api.rpc.system.name &&
    api.rpc.system.version ? (
    <Main {...props} />
  ) : null
}
