import React, { useEffect, useState } from 'react'
import { Card, Icon, Grid, Statistic } from 'semantic-ui-react'

function Main(props) {
  const { client }  = props
  const [nodeInfo, setNodeInfo] = useState({})

  useEffect(() => {
    const getInfo = async () => {
      console.log('client.getChainId()', client.getChainId())
      try {
        const [chain, nodeName, nodeVersion] = await Promise.all([
          client.getChainId(),
          client.getChainId(),
          client.getChainId(),
        ]);console.log([chain, nodeName, nodeVersion])
        setNodeInfo({ chain, nodeName, nodeVersion })
      } catch (e) {
        console.error(e)
      }
    }
    getInfo()
  }, [client])

  const [blockNumber, setBlockNumber] = useState(0)
  // const [blockNumberTimer, setBlockNumberTimer] = useState(0)

  useEffect(async () => {
    let height = await client.getHeight();
    console.log('height', height)
    setBlockNumber(height)
  }, [client])

  const timer = () => {
    // setBlockNumberTimer(time => time + 1)
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
          <Card.Description>{'socket'}</Card.Description>
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
      </Card>
    </Grid.Column>
  )
}

export default function NodeInfoCos(props) {
  const client = props.client; console.log('client', client)
  return client ? (
    <Main {...props} />
  ) : null
}
